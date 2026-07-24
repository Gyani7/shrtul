import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center mesh-bg px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 mb-6">
            <Compass className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The link you followed doesn&apos;t exist, has expired, or was deactivated.
          </p>
          <Link href="/">
            <button className="inline-flex h-11 px-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
