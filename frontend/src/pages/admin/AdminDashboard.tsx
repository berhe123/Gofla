import { DollarSign, Package, ShoppingCart, Star, TrendingUp, Users } from 'lucide-react';
import { classForStatus, formatPrice } from '@/shared/lib/format';
import { useAnalytics } from '@/features/admin/api';

export default function AdminDashboard() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) return <p className="text-muted-foreground">Loading dashboard…</p>;

  const maxSale = Math.max(...data.salesByDay.map((d) => d.total), 1);

  const kpis = [
    { label: 'Revenue', value: formatPrice(data.kpis.revenue), icon: DollarSign },
    { label: 'Orders', value: data.kpis.orders, icon: ShoppingCart },
    { label: 'Customers', value: data.kpis.customers, icon: Users },
    { label: 'Products', value: data.kpis.products, icon: Package },
    { label: 'Pending reviews', value: data.kpis.pendingReviews, icon: Star },
    { label: 'Low stock', value: data.kpis.lowStockVariants, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
            <k.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-6 font-semibold">Sales · last 14 days</h2>
          <div className="flex h-48 items-end gap-1.5">
            {data.salesByDay.map((d) => (
              <div key={d.date} className="group relative flex-1">
                <div
                  className="rounded-t bg-primary/70 transition group-hover:bg-primary"
                  style={{ height: `${(d.total / maxSale) * 100}%`, minHeight: 4 }}
                  title={`${d.date}: ${formatPrice(d.total)}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Top products</h2>
          <ul className="space-y-3">
            {data.topProducts.length ? (
              data.topProducts.map((p) => (
                <li key={p.name} className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className="font-medium text-muted-foreground">{p.units} sold</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No sales yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Recent orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-3 font-medium">{o.number}</td>
                  <td className="py-3 text-muted-foreground">{o.customer}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${classForStatus(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
