'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabase-browser';
import { toast } from 'sonner';

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const shouldClaim = searchParams.get('claim') === 'true';

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  }, [searchParams]);

  async function claimGuestLinks(userId: string): Promise<void> {
    const sessionId = typeof window !== 'undefined'
      ? localStorage.getItem('shrtul_guest_session')
      : null;

    if (!sessionId) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.claimed_count > 0) {
          toast.success(`Claimed ${data.claimed_count} guest link${data.claimed_count > 1 ? 's' : ''}!`);
        }
        localStorage.removeItem('shrtul_guest_session');
      }
    } catch {
      // non-critical, claim can be retried
    }
  }

  async function ensureWorkspace(): Promise<boolean> {
    const { error } = await supabase.rpc('ensure_user_workspace');
    if (error) {
      const { data: existing } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', (await supabase.auth.getUser()).data.user?.id || '')
        .limit(1);
      return !!(existing && existing.length > 0);
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          await ensureWorkspace();
          if (shouldClaim) {
            await claimGuestLinks(data.user.id);
          }
        }

        toast.success('Account created! Welcome to Shrtul.');
        router.push(redirectTo);
        router.refresh();
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          await ensureWorkspace();
          if (shouldClaim) {
            await claimGuestLinks(data.user.id);
          }
        }

        toast.success('Welcome back!');
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <div className="flex items-center justify-between p-4">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <Card className="w-full max-w-md shadow-xl border-border/60 animate-scale-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {mode === 'signup'
                ? 'Start shortening and tracking your links today'
                : 'Sign in to manage your short links'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'signup' ? 'Create account' : 'Sign in'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'signup' ? (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
