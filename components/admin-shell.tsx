'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, LayoutDashboard, Users, Link2, Settings, BarChart3, Flag, MessageSquare, LogOut, Menu, X, Home } from 'lucide-react';
import type { Profile } from '@/lib/types';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/links', label: 'Links', icon: Link2 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/support', label: 'Support', icon: MessageSquare },
];

export function AdminShell({ profile, email, children }: { profile: Profile; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error text-error-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold block leading-tight">Admin Panel</span>
              <span className="text-xs text-muted-foreground">Shrtul</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  active ? 'bg-error text-error-foreground shadow-lg shadow-error/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Home className="h-4 w-4" /> User Dashboard
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error/15 text-error font-semibold text-xs">
              {(profile.full_name || email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{profile.full_name || email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col animate-slide-in">
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <span className="text-sm font-bold">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      active ? 'bg-error text-error-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 glass-strong border-b border-border h-16 flex items-center justify-between px-4 md:px-8">
          <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-error/15 text-error font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
