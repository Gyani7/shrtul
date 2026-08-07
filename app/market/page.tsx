import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MarketplaceBrowser } from '@/components/demo/marketplace-browser';
import Link from 'next/link';
import { Store, ArrowRight, Check, Upload, GitFork, Star, Package, RefreshCw, Tag } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shrtul Market — Experience Marketplace',
  description: 'Publish, sell, fork, clone, rate, and install interactive experiences from a community marketplace. Like an app store for click experiences.',
  alternates: { canonical: 'https://shrtul.com/market' },
  openGraph: { title: 'Shrtul Market — Experience Marketplace', description: 'Publish, sell, fork, and install experiences from the community.', url: 'https://shrtul.com/market' },
};

const FEATURES = [
  { icon: Upload, title: 'Publish', desc: 'Share your experiences with the community. Free or paid.' },
  { icon: GitFork, title: 'Fork & Clone', desc: 'Fork any public experience and customize it for your needs.' },
  { icon: Star, title: 'Rate & Review', desc: 'Community ratings help surface the best experiences.' },
  { icon: Package, title: 'Version', desc: 'Every experience is versioned. Update without breaking existing links.' },
  { icon: RefreshCw, title: 'Auto-Update', desc: 'Installed experiences update automatically when the author pushes changes.' },
  { icon: Tag, title: 'Sell', desc: 'Set your own price. Keep 80% of every sale. The marketplace handles the rest.' },
];

export default function MarketPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden mesh-bg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 right-1/3 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-float-slow" />
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
              <Store className="h-3.5 w-3.5 text-primary" /> Shrtul Market
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              An app store<br />
              <span className="gradient-text">for click experiences.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              Publish, sell, fork, and install interactive experiences from a community marketplace. Built by creators, for creators.
            </p>
          </div>
        </section>

        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse the Marketplace</h2>
              <p className="text-sm text-muted-foreground">Real templates, plugins, and themes with install buttons. Try it.</p>
            </div>
            <MarketplaceBrowser />
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <h2 className="text-3xl font-bold mb-4">Build and sell experiences</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Turn your experience design skills into revenue. The marketplace handles payments, updates, and distribution.</p>
            <Link href="/login?mode=signup" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
              Start Selling <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
