'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error('[dashboard/error-boundary]', error.message, error.digest, error.stack);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-error" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred while loading the dashboard.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
