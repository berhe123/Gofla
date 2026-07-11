import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { mapProduct, PRODUCT_INCLUDE, computeFinalPrice } from '../product/product.mapper';
import { AddCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { variant: { include: { product: { include: PRODUCT_INCLUDE } } } },
      orderBy: { id: 'asc' },
    });

    const mappedItems = items.map((item) => {
      const product = mapProduct(item.variant.product);
      const unitPrice = item.variant.price
        ? computeFinalPrice(item.variant.price, item.variant.product.discount)
        : product.finalPrice;
      return {
        id: item.id,
        product,
        variant: {
          id: item.variant.id,
          sku: item.variant.sku,
          size: item.variant.size,
          color: item.variant.color,
          material: item.variant.material,
          price: item.variant.price ? Number(item.variant.price) : null,
          stock: item.variant.stock,
        },
        quantity: item.quantity,
        unitPrice,
        lineTotal: Number((unitPrice * item.quantity).toFixed(2)),
      };
    });

    return this.withTotals(cart.id, mappedItems);
  }

  private withTotals(id: string, items: any[]) {
    const subtotal = Number(items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2));
    const freeThreshold = this.config.get<number>('commerce.freeShippingThreshold')!;
    const flatFee = this.config.get<number>('commerce.shippingFlatFee')!;
    const taxRate = this.config.get<number>('commerce.taxRate')!;

    const shipping = subtotal === 0 || subtotal >= freeThreshold ? 0 : flatFee;
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + shipping + tax).toFixed(2));
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);

    return { id, items, subtotal, shipping, tax, total, itemCount };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.stock < dto.quantity) throw new BadRequestException('Not enough stock');

    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: dto.variantId } },
      update: { quantity: { increment: dto.quantity } },
      create: { cartId: cart.id, variantId: dto.variantId, quantity: dto.quantity },
    });
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true },
    });
    if (!item || item.cartId !== cart.id) throw new NotFoundException('Cart item not found');
    if (item.variant.stock < quantity) throw new BadRequestException('Not enough stock');

    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }
}
