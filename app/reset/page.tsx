'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Link2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Session is established from the recovery link
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8">
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Shrtul</span>
          </Link>

          <h1 className="text-2xl font-bold text-center mb-2">Set new password</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Enter your new password</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 border border-error/30 px-3 py-2 text-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {done ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 border border-success/30 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Password updated! Redirecting...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              <Button type="submit" className="w-full" loading={loading} size="lg">
                <Lock className="h-4 w-4" /> Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
