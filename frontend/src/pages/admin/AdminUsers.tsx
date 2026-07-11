import { formatDate } from '@/shared/lib/format';
import { useAdminUsers } from '@/features/admin/api';

export default function AdminUsers() {
  const { data } = useAdminUsers();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Users</h1>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">
                  {u.firstName} {u.lastName}
                </td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      u.role === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4">{u.orderCount}</td>
                <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
