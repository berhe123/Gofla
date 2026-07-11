import { toast } from 'sonner';
import { classForStatus, formatDate, formatPrice } from '@/shared/lib/format';
import { useAdminOrders, useUpdateOrderStatus } from '@/features/admin/api';

const STATUSES = ['PENDING', 'PAID', 'FULFILLED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrders() {
  const { data } = useAdminOrders();
  const update = useUpdateOrderStatus();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Orders</h1>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{o.number}</td>
                <td className="p-4 text-muted-foreground">{o.customer}</td>
                <td className="p-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
                <td className="p-4">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) =>
                      update.mutate(
                        { id: o.id, status: e.target.value },
                        { onSuccess: () => toast.success('Order updated') },
                      )
                    }
                    className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${classForStatus(o.status)}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-card text-foreground">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
