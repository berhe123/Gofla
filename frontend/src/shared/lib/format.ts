export function formatPrice(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function classForStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-muted text-muted-foreground',
    PAID: 'bg-emerald-500/15 text-emerald-400',
    FULFILLED: 'bg-blue-500/15 text-blue-400',
    SHIPPED: 'bg-indigo-500/15 text-indigo-400',
    DELIVERED: 'bg-emerald-500/15 text-emerald-400',
    CANCELLED: 'bg-red-500/15 text-red-400',
    REFUNDED: 'bg-amber-500/15 text-amber-400',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}
