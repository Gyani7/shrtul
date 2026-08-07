import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <div className="flex items-center justify-between p-4">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Link expired</h1>
          <p className="text-muted-foreground mb-8">
            This short link has passed its expiry date and is no longer accessible.
            Contact the person who shared it with you for an updated link.
          </p>
          <Button asChild>
            <Link href="/">
              Go to homepage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
