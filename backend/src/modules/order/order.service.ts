import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { MailerService } from '../../infra/mailer/mailer.service';
import { NotificationService } from '../notification/notification.service';
import { CartService } from '../cart/cart.service';
import { PaymentService } from './payment.service';
import { CheckoutDto } from './dto/checkout.dto';

function orderNumber(): string {
  return `GOF-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly payment: PaymentService,
    private readonly mailer: MailerService,
    private readonly notifications: NotificationService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cart.getCart(userId);
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    // Resolve shipping address
    let addressId = dto.addressId;
    if (!addressId && dto.address) {
      const created = await this.prisma.address.create({ data: { ...dto.address, userId } });
      addressId = created.id;
    }
    if (!addressId) throw new BadRequestException('A shipping address is required');
    const address = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');

    // Validate stock atomically and build order
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variant.id } });
        if (!variant || variant.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
        }
      }

      const created = await tx.order.create({
        data: {
          number: orderNumber(),
          userId,
          status: 'PENDING',
          subtotal: new Prisma.Decimal(cart.subtotal),
          shipping: new Prisma.Decimal(cart.shipping),
          tax: new Prisma.Decimal(cart.tax),
          total: new Prisma.Decimal(cart.total),
          currency: 'USD',
          addressId: address.id,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variant.id,
              productName: item.product.name,
              productImage: item.product.images[0]?.url ?? null,
              variantLabel: [item.variant.color, item.variant.size].filter(Boolean).join(' / '),
              unitPrice: new Prisma.Decimal(item.unitPrice),
              quantity: item.quantity,
            })),
          },
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    // Create payment intent
    const intent = await this.payment.createIntent(cart.total, 'USD', { orderId: order.id });
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'stripe',
        intentId: intent.intentId,
        amount: new Prisma.Decimal(cart.total),
        currency: 'USD',
        status: intent.mocked ? 'SUCCEEDED' : 'REQUIRES_PAYMENT',
      },
    });

    // Mock payments settle instantly.
    if (intent.mocked) {
      await this.markPaid(order.id);
    }

    await this.cart.clear(userId);

    return {
      order: await this.findOne(userId, order.id),
      payment: { clientSecret: intent.clientSecret, mocked: intent.mocked },
    };
  }

  async markPaid(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: { user: true },
    });
    await this.prisma.payment.updateMany({
      where: { orderId },
      data: { status: 'SUCCEEDED' },
    });
    await this.notifications.create(order.userId, 'ORDER_PAID', 'Payment confirmed', `Your order ${order.number} is confirmed.`);
    await this.mailer.send(
      order.user.email,
      `Order ${order.number} confirmed`,
      `<h1>Thank you for your order!</h1><p>Order <strong>${order.number}</strong> is confirmed and being prepared.</p>`,
    );
    return order;
  }

  async list(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.map(o));
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, address: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    return this.map(order);
  }

  private map(order: Prisma.OrderGetPayload<{ include: { items: true; address: true } }>) {
    return {
      id: order.id,
      number: order.number,
      status: order.status,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.variantId ?? '',
        productName: i.productName,
        productImage: i.productImage,
        variantLabel: i.variantLabel,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        lineTotal: Number((Number(i.unitPrice) * i.quantity).toFixed(2)),
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      currency: order.currency,
      shippingAddress: order.address,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  // --- Admin ---
  async updateStatus(id: string, status: string, trackingNumber?: string) {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException('Invalid status');
    }
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus, trackingNumber },
      include: { items: true, address: true },
    });
    await this.notifications.create(
      order.userId,
      'ORDER_UPDATE',
      `Order ${order.number} ${status.toLowerCase()}`,
      `Your order status is now ${status}.`,
    );
    return this.map(order);
  }

  async adminList() {
    const orders = await this.prisma.order.findMany({
      include: { items: true, address: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => ({ ...this.map(o), customer: `${o.user.firstName} ${o.user.lastName}`, email: o.user.email }));
  }
}
