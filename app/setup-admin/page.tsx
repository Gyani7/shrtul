'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Check, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BootstrapAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBootstrap = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bootstrap', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSuccess(true);
      setTimeout(() => router.push('/admin'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error/15 mb-2">
              <Shield className="h-6 w-6 text-error" />
            </div>
            <CardTitle>Become Admin</CardTitle>
            <CardDescription>
              No admin exists yet. Click below to claim the first admin role for this platform.
              This is only available before the first admin is set.
            </CardDescription>
          </CardHeader>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 border border-error/30 px-3 py-2 text-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {success ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 border border-success/30 px-3 py-2 text-sm text-success">
              <Check className="h-4 w-4 shrink-0" /> You are now an admin! Redirecting...
            </div>
          ) : (
            <Button onClick={handleBootstrap} loading={loading} className="w-full" size="lg">
              <Shield className="h-4 w-4" /> Claim Admin Role
            </Button>
          )}

          <div className="mt-6 text-center">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
              Go to dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
