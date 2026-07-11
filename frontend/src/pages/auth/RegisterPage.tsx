import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAuthStore } from '@/entities/user/store';
import { AuthShell } from './LoginPage';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values);
      toast.success('Account created — welcome to Gofla!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Could not create account');
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Gofla and let your camera do the shopping.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="First name" {...register('firstName', { required: true })} />
          <Input placeholder="Last name" {...register('lastName', { required: true })} />
        </div>
        <Input type="email" placeholder="Email" {...register('email', { required: true })} />
        <div>
          <Input
            type="password"
            placeholder="Password (min 8 chars)"
            {...register('password', { required: true, minLength: 8 })}
          />
          {errors.password && (
            <span className="mt-1 block text-xs text-destructive">
              Password must be at least 8 characters
            </span>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
