'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutDashboard, Shield } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-browser';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        setUser(data as Profile | null);
      }
      setLoading(false);
    })();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/terms" label="Terms" active={pathname === '/terms'} />
            <NavLink href="/privacy" label="Privacy" active={pathname === '/privacy'} />
            {user?.is_admin && (
              <NavLink href="/admin" label="Admin" active={pathname?.startsWith('/admin') ?? false} icon={<Shield className="h-3.5 w-3.5" />} />
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {!loading && user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : !loading ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login?mode=signup">Get started</Link>
              </Button>
            </>
          ) : null}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            <MobileLink href="/" label="Home" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/terms" label="Terms" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/privacy" label="Privacy" onClick={() => setMobileOpen(false)} />
            {!loading && user ? (
              <MobileLink href="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
            ) : (
              <>
                <MobileLink href="/login" label="Sign in" onClick={() => setMobileOpen(false)} />
                <MobileLink href="/login?mode=signup" label="Get started" onClick={() => setMobileOpen(false)} />
              </>
            )}
            {user?.is_admin && (
              <MobileLink href="/admin" label="Admin" onClick={() => setMobileOpen(false)} />
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {label}
    </Link>
  );
}
