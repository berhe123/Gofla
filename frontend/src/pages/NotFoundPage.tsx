import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';

export default function NotFoundPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center text-center">
      <div>
        <p className="font-display text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          The page you're looking for has wandered off. Let's get you back.
        </p>
        <Link to="/">
          <Button className="mt-6">Back home</Button>
        </Link>
      </div>
    </div>
  );
}
