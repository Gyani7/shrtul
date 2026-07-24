import Link from 'next/link';
import { SearchX, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function LinkNotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <div className="flex items-center justify-between p-4">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <SearchX className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Link not found</h1>
          <p className="text-muted-foreground mb-8">
            The short link you&apos;re looking for doesn&apos;t exist or has been removed.
            Check the URL and try again.
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
