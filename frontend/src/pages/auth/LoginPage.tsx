import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAuthStore } from '@/entities/user/store';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string; password: string }>();

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      const to = (location.state as { from?: string })?.from ?? '/';
      navigate(to);
    } catch {
      toast.error('Invalid email or password');
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue shopping smarter.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="email" placeholder="Email" {...register('email', { required: true })} />
        <Input type="password" placeholder="Password" {...register('password', { required: true })} />
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Gofla?{' '}
        <Link to="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        Demo: customer@gofla.com / Customer123! · admin@gofla.com / Admin123!
      </div>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container grid min-h-[80vh] place-items-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-ember font-display text-lg font-bold text-white">
            G
          </span>
        </Link>
        <h1 className="text-center font-display text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
