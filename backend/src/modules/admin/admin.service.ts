import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async analytics() {
    const paidStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.FULFILLED,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const [revenueAgg, orderCount, customerCount, productCount, pendingReviews, lowStock] =
      await this.prisma.$transaction([
        this.prisma.order.aggregate({
          where: { status: { in: paidStatuses } },
          _sum: { total: true },
        }),
        this.prisma.order.count(),
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.review.count({ where: { status: 'PENDING' } }),
        this.prisma.productVariant.count({ where: { stock: { lt: 5 } } }),
      ]);

    const recentOrders = await this.prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    // Sales over the last 14 days
    const since = new Date();
    since.setDate(since.getDate() - 13);
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { in: paidStatuses } },
      select: { total: true, createdAt: true },
    });
    const byDay = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      byDay.set(d.toISOString().slice(0, 10), 0);
    }
    orders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total));
    });

    // Top products by units sold
    const topItems = await this.prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return {
      kpis: {
        revenue: Number(revenueAgg._sum.total ?? 0),
        orders: orderCount,
        customers: customerCount,
        products: productCount,
        pendingReviews,
        lowStockVariants: lowStock,
      },
      salesByDay: Array.from(byDay.entries()).map(([date, total]) => ({
        date,
        total: Number(total.toFixed(2)),
      })),
      topProducts: topItems.map((t) => ({ name: t.productName, units: t._sum.quantity ?? 0 })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        total: Number(o.total),
        customer: `${o.user.firstName} ${o.user.lastName}`,
        createdAt: o.createdAt.toISOString(),
      })),
    };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    return users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      orderCount: u._count.orders,
    }));
  }
}
