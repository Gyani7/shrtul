'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LayoutDashboard, Shield, ChevronDown, Sparkles, Wand2, Workflow, BarChart3, Store, FlaskConical, Code2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-browser';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

const ECOSYSTEM_LINKS = [
  { href: '/platform', label: 'Platform Overview', desc: 'The complete ecosystem' },
  { href: '/studio', label: 'Shrtul Studio', desc: 'AI Experience Builder', icon: Wand2 },
  { href: '/flow', label: 'Shrtul Flow', desc: 'Automation & Workflow Engine', icon: Workflow },
  { href: '/insights', label: 'Shrtul Insights', desc: 'AI Analytics Platform', icon: BarChart3 },
  { href: '/market', label: 'Shrtul Market', desc: 'Experience Marketplace', icon: Store },
  { href: '/labs', label: 'Shrtul Labs', desc: 'Experimental Features', icon: FlaskConical },
  { href: '/developer-api', label: 'Shrtul Developer', desc: 'API, SDK, Webhooks', icon: Code2 },
];

const FEATURE_LINKS = [
  { href: '/smart-links', label: 'Smart Links' },
  { href: '/click-experience', label: 'Click Experiences' },
  { href: '/link-analytics', label: 'Analytics' },
  { href: '/qr-experience', label: 'QR Experiences' },
  { href: '/custom-domain', label: 'Custom Domains' },
];

const SOLUTIONS_LINKS = [
  { href: '/marketing-links', label: 'Marketing' },
  { href: '/link-campaigns', label: 'Campaigns' },
  { href: '/link-personalization', label: 'Personalization' },
  { href: '/interactive-links', label: 'Interactive Links' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

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
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />

            {/* Ecosystem Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setEcosystemOpen(true)}
              onMouseLeave={() => setEcosystemOpen(false)}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Ecosystem <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {ecosystemOpen && (
                <div className="absolute top-full left-0 pt-2 w-80 animate-fade-in">
                  <div className="glass-strong rounded-2xl p-3 shadow-2xl">
                    <Link href="/platform" className="block rounded-lg px-3 py-2.5 hover:bg-muted transition-colors mb-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Platform Overview</p>
                          <p className="text-xs text-muted-foreground">The complete ecosystem</p>
                        </div>
                      </div>
                    </Link>
                    <div className="h-px bg-border my-1" />
                    {ECOSYSTEM_LINKS.slice(1).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {link.icon && <link.icon className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{link.label}</p>
                            <p className="text-xs text-muted-foreground">{link.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 pt-2 w-48 animate-fade-in">
                  <div className="glass-strong rounded-xl p-2 shadow-xl">
                    {FEATURE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Solutions <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 pt-2 w-48 animate-fade-in">
                  <div className="glass-strong rounded-xl p-2 shadow-xl">
                    {SOLUTIONS_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/templates" label="Templates" active={pathname === '/templates'} />
            <NavLink href="/docs" label="Docs" active={pathname === '/docs'} />
            <NavLink href="/pricing" label="Pricing" active={pathname === '/pricing'} />
            {user?.is_admin && (
              <NavLink href="/admin" label="Admin" active={pathname?.startsWith('/admin') ?? false} icon={<Shield className="h-3.5 w-3.5" />} />
            )}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-3">
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
                <Link href="/login?mode=signup">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Get started
                </Link>
              </Button>
            </>
          ) : null}
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4 max-h-[80vh] overflow-y-auto">
            <MobileLink href="/" label="Home" onClick={() => setMobileOpen(false)} />
            <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground/60">Ecosystem</div>
            {ECOSYSTEM_LINKS.map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} onClick={() => setMobileOpen(false)} />
            ))}
            <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground/60">Features</div>
            {FEATURE_LINKS.map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} onClick={() => setMobileOpen(false)} />
            ))}
            <div className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground/60">Solutions</div>
            {SOLUTIONS_LINKS.map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} onClick={() => setMobileOpen(false)} />
            ))}
            <MobileLink href="/templates" label="Templates" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/docs" label="Docs" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/pricing" label="Pricing" onClick={() => setMobileOpen(false)} />
            {!loading && user ? (
              <MobileLink href="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
            ) : (
              <>
                <MobileLink href="/login" label="Sign in" onClick={() => setMobileOpen(false)} />
                <MobileLink href="/login?mode=signup" label="Get started" onClick={() => setMobileOpen(false)} />
              </>
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
