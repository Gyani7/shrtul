'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Link2, BarChart3, Settings, LogOut, Menu, X, Shield, ExternalLink, Sparkles } from 'lucide-react';
import type { Profile } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/links', label: 'My Links', icon: Link2 },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guestLinks, setGuestLinks] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const guestSessionId = localStorage.getItem('guest_session_id');
    if (guestSessionId) {
      supabase
        .from('links')
        .select('id', { count: 'exact', head: true })
        .eq('is_guest', true)
        .eq('guest_session_id', guestSessionId)
        .then(({ count }) => setGuestLinks(count || 0));
    }
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleClaimGuest = async () => {
    const guestSessionId = localStorage.getItem('guest_session_id');
    if (!guestSessionId) return;

    const supabase = createClient();
    const { data } = await supabase.rpc('claim_guest_links', { p_session_id: guestSessionId });
    const result = data as { claimed_count?: number } | null;
    if (result?.claimed_count && result.claimed_count > 0) {
      localStorage.removeItem('guest_session_id');
      setGuestLinks(0);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 glass-strong border-r border-border/50 hidden md:flex flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">Shrtul</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {profile.is_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          )}
        </nav>

        {guestLinks > 0 && (
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
              <p className="text-xs font-medium text-primary mb-1">Claim {guestLinks} guest links</p>
              <p className="text-xs text-muted-foreground mb-2">Move them to your account</p>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleClaimGuest}>
                <Sparkles className="h-3 w-3" /> Claim now
              </Button>
            </div>
          </div>
        )}

        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-sm">
              {(profile.full_name || email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{profile.full_name || email}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start mt-1 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 glass-strong border-r border-border/50 flex flex-col animate-slide-in">
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Link2 className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold">Shrtul</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {profile.is_admin && (
                <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              )}
            </nav>
            <div className="border-t border-border/50 p-3">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 glass-strong border-b border-border/50 h-16 flex items-center justify-between px-4 md:px-8">
          <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:block">
              <Button variant="ghost" size="sm">View site</Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
