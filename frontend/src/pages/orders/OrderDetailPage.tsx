import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Package, Truck } from 'lucide-react';
import { classForStatus, formatDate, formatPrice } from '@/shared/lib/format';
import { PageLoader } from '@/shared/ui/page-loader';
import { useOrder } from '@/entities/order/api';

const STEPS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) return <PageLoader />;

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="container py-10">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${classForStatus(order.status)}`}>
          {order.status}
        </span>
      </div>

      {stepIndex >= 0 && (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-card p-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < stepIndex ? <CheckCircle2 className="h-5 w-5" /> : i === 2 ? <Truck className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              </div>
              <span className="mt-2 text-xs capitalize text-muted-foreground">{step.toLowerCase()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              {item.productImage && (
                <img src={item.productImage} alt={item.productName} className="h-20 w-20 rounded-xl object-cover" />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                {item.variantLabel && <p className="text-sm text-muted-foreground">{item.variantLabel}</p>}
                <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="font-semibold">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <aside className="h-fit space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Summary</h2>
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            <Row label="Shipping" value={order.shipping === 0 ? 'Free' : formatPrice(order.shipping)} />
            <Row label="Tax" value={formatPrice(order.tax)} />
            <div className="my-3 border-t border-border" />
            <Row label="Total" value={formatPrice(order.total)} bold />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-sm">
            <h2 className="mb-3 text-lg font-semibold">Shipping to</h2>
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="text-muted-foreground">{order.shippingAddress.line2}</p>}
            <p className="text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p className="text-muted-foreground">{order.shippingAddress.country}</p>
            {order.trackingNumber && (
              <p className="mt-3 text-primary">Tracking: {order.trackingNumber}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'text-lg font-bold' : 'text-sm text-muted-foreground'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-foreground' : ''}>{value}</span>
    </div>
  );
}
