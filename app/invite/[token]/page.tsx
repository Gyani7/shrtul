'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-browser';
import { toast } from 'sonner';

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      // Token could be a workspace invite token — validate it
      // For now, treat any token as valid and show signup form
      setStatus('valid');
    })();
  }, []);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
        });
      }

      setStatus('accepted');
      toast.success('Welcome to the team!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex flex-col bg-grid">
        <div className="flex items-center justify-between p-4">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md animate-scale-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3">You&apos;re all set!</h1>
            <p className="text-muted-foreground mb-2">Redirecting you to your dashboard...</p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <div className="flex items-center justify-between p-4">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <Card className="w-full max-w-md shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <CardTitle>Join the workspace</CardTitle>
            <CardDescription>
              You&apos;ve been invited to collaborate. Create your account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Accept invite
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
