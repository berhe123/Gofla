import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { formatPrice } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useCart } from '@/entities/cart/api';
import { useCheckout, type CheckoutPayload } from '@/entities/order/api';

type FormValues = CheckoutPayload['address'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const checkout = useCheckout();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { country: 'United States' },
  });

  const onSubmit = (address: FormValues) => {
    checkout.mutate(
      { address },
      {
        onSuccess: ({ order, payment }) => {
          toast.success(
            payment.mocked
              ? 'Order placed & paid (demo mode) 🎉'
              : 'Order created — complete payment to confirm.',
          );
          navigate(`/orders/${order.id}`);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Checkout failed'),
      },
    );
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container grid min-h-[50vh] place-items-center text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Nothing to check out</h1>
          <Button className="mt-4" onClick={() => navigate('/shop')}>Browse products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <Field label="Full name" error={errors.fullName?.message}>
            <Input {...register('fullName', { required: 'Required' })} />
          </Field>
          <Field label="Address line 1" error={errors.line1?.message}>
            <Input {...register('line1', { required: 'Required' })} />
          </Field>
          <Field label="Address line 2 (optional)">
            <Input {...register('line2')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city?.message}>
              <Input {...register('city', { required: 'Required' })} />
            </Field>
            <Field label="State / Region">
              <Input {...register('state')} />
            </Field>
            <Field label="Postal code" error={errors.postalCode?.message}>
              <Input {...register('postalCode', { required: 'Required' })} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <Input {...register('country', { required: 'Required' })} />
            </Field>
          </div>
          <Field label="Phone (optional)">
            <Input {...register('phone')} />
          </Field>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Summary</h2>
          <div className="max-h-52 space-y-3 overflow-auto">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.product.images[0]?.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1">{item.product.name}</p>
                  <p className="text-muted-foreground">× {item.quantity}</p>
                </div>
                <span className="text-sm">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-border" />
          <SummaryRow label="Subtotal" value={formatPrice(cart.subtotal)} />
          <SummaryRow label="Shipping" value={cart.shipping === 0 ? 'Free' : formatPrice(cart.shipping)} />
          <SummaryRow label="Tax" value={formatPrice(cart.tax)} />
          <div className="my-3 border-t border-border" />
          <SummaryRow label="Total" value={formatPrice(cart.total)} bold />
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={checkout.isPending}>
            <Lock className="h-4 w-4" /> {checkout.isPending ? 'Processing…' : `Pay ${formatPrice(cart.total)}`}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secured by Stripe · demo mode auto-confirms
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? 'text-lg font-bold' : 'text-sm text-muted-foreground'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-foreground' : ''}>{value}</span>
    </div>
  );
}
