import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { classForStatus, formatDate, formatPrice } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { useOrders } from '@/entities/order/api';

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="container grid min-h-[60vh] place-items-center text-center">
        <div>
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">No orders yet</h1>
          <Link to="/shop"><Button className="mt-6">Start shopping</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold">Your orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition hover:ember-glow"
          >
            <div>
              <p className="font-semibold">{order.number}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)} · {order.items.length} items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${classForStatus(order.status)}`}>
                {order.status}
              </span>
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
