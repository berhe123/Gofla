import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { api, unwrap } from '@/shared/api/client';
import { useAuthStore } from '@/entities/user/store';
import type { UserDto } from '@/shared';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName },
  });

  const onSubmit = async (values: { firstName?: string; lastName?: string }) => {
    try {
      const updated = await unwrap<UserDto>(api.patch('/users/me', values));
      setUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="mb-8 font-display text-3xl font-bold">Your profile</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">First name</span>
              <Input {...register('firstName')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Last name</span>
              <Input {...register('lastName')} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email</span>
            <Input value={user?.email ?? ''} disabled />
          </label>
          <div className="flex justify-between">
            <Button type="submit">Save changes</Button>
            <Button type="button" variant="outline" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
