import Link from 'next/link';
import { ShieldX, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function GonePage() {
  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <div className="flex items-center justify-between p-4">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-3">410</h1>
          <p className="text-muted-foreground mb-8">
            This short link has been permanently removed and is no longer available.
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
