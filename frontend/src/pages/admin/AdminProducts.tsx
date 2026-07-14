import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '@/shared/lib/format';
import { resolveMediaUrl } from '@/shared/lib/media';
import { useProducts } from '@/entities/product/api';
import { useDeleteProduct } from '@/features/admin/api';

export default function AdminProducts() {
  const { data } = useProducts({ pageSize: 50 });
  const del = useDeleteProduct();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Products</h1>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Stock</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={resolveMediaUrl(p.images[0]?.url)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{p.category?.name}</td>
                <td className="p-4">{formatPrice(p.finalPrice)}</td>
                <td className="p-4">{p.rating.toFixed(1)}</td>
                <td className="p-4">
                  <span className={p.inStock ? 'text-emerald-400' : 'text-destructive'}>
                    {p.inStock ? 'In stock' : 'Sold out'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() =>
                      del.mutate(p.id, {
                        onSuccess: () => toast.success('Product archived'),
                        onError: () => toast.error('Failed'),
                      })
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
