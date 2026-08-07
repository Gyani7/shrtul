import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { ArrowRight, Wand2, Workflow, BarChart3, Store, FlaskConical, Code2, Sparkles, Check, Zap, Brain, Layers, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform — The AI Click Experience Ecosystem',
  description: 'Shrtul X is not a URL shortener. It is an ecosystem of products — Studio, Flow, Insights, Market, Labs, and Developer — that turn every click into an intelligent, interactive, measurable experience.',
  alternates: { canonical: 'https://shrtul.com/platform' },
  openGraph: { title: 'Shrtul X Platform — AI Click Experience Ecosystem', description: 'An ecosystem of products that turn every click into an intelligent experience.', url: 'https://shrtul.com/platform' },
};

const PRODUCTS = [
  { href: '/studio', icon: Wand2, name: 'Shrtul Studio', tagline: 'AI Experience Builder', desc: 'Design interactive click experiences with a modular block system. Drag, drop, configure, and preview in real time.', features: ['Block-based experience editor', 'Live preview as you build', 'AI-generated experiences from prompts', 'Custom themes and branding'], color: 'from-primary to-accent' },
  { href: '/flow', icon: Workflow, name: 'Shrtul Flow', tagline: 'Automation & Workflow Engine', desc: 'Build visual workflows that trigger experiences based on conditions. If this, then that — for every click.', features: ['Visual workflow builder', 'Condition-based routing', 'Schedule-based triggers', 'Webhook integrations'], color: 'from-accent to-success' },
  { href: '/insights', icon: BarChart3, name: 'Shrtul Insights', tagline: 'AI Analytics Platform', desc: 'Go beyond click counting. Track attention, completion, drop-off, and conversion with AI-generated insights.', features: ['Attention and completion tracking', 'Funnel analysis', 'AI-generated insights', 'Predictive analytics'], color: 'from-primary to-primary' },
  { href: '/market', icon: Store, name: 'Shrtul Market', tagline: 'Experience Marketplace', desc: 'Publish, sell, fork, and install experiences from a community marketplace. Like an app store for clicks.', features: ['Publish and sell experiences', 'Fork and clone templates', 'Version history', 'Community ratings'], color: 'from-accent to-primary' },
  { href: '/labs', icon: FlaskConical, name: 'Shrtul Labs', tagline: 'Experimental Features', desc: 'Try cutting-edge features before they ship. AI avatars, voice experiences, AR redirects, and more.', features: ['Early access features', 'AI voice experiences', 'AR redirect experiments', 'Community experiments'], color: 'from-success to-accent' },
  { href: '/developer-api', icon: Code2, name: 'Shrtul Developer', tagline: 'API, SDK, Webhooks', desc: 'Build on top of the platform with a full REST API, SDKs, and webhook system.', features: ['REST API with auth', 'SDKs for major languages', 'Real-time webhooks', 'Plugin system'], color: 'from-primary to-accent' },
];

const PHILOSOPHY = [
  { icon: Layers, title: 'Experiences, not links', desc: 'Users design experiences. Links are only the delivery mechanism. The experience is the product.' },
  { icon: Brain, title: 'AI is the brain', desc: 'AI decides the best experience, timing, animation, CTA, and redirect strategy. The platform improves from usage data.' },
  { icon: Zap, title: 'Modular by design', desc: 'Every experience is built from independent blocks. New blocks can be installed without modifying the core.' },
  { icon: Globe, title: 'Built for scale', desc: 'Millions of users, billions of clicks, marketplace, plugins, mobile apps, and white-label deployments.' },
];

export default function PlatformPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Shrtul X Platform',
    description: 'AI Click Experience Platform ecosystem with Studio, Flow, Insights, Market, Labs, and Developer products.',
    url: 'https://shrtul.com/platform',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden mesh-bg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
            <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>
          <div className="container mx-auto px-4 py-20 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-8 backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              The AI Click Experience Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance animate-slide-up">
              Not a URL shortener.<br />
              <span className="gradient-text">An entire ecosystem.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Six products, one platform, one mission: every click becomes an intelligent, interactive, measurable experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/login?mode=signup" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
                Start building <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/" className="inline-flex h-12 px-8 items-center justify-center rounded-xl border border-border hover:bg-muted text-foreground font-medium transition-all">
                See it in action
              </Link>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built from first principles</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We didn&apos;t copy existing URL shorteners. We designed a new category from scratch.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {PHILOSOPHY.map((p, i) => (
                <div key={p.title} className="glass rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground mb-4">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Six products. One platform.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each product is powerful on its own. Together, they form a complete ecosystem for every click.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PRODUCTS.map((product, i) => (
              <Link
                key={product.href}
                href={product.href}
                className="group glass-strong rounded-2xl p-8 card-hover animate-slide-up block"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${product.color} text-white shadow-lg`}>
                    <product.icon className="h-7 w-7" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mb-2">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="text-sm text-primary font-medium">{product.tagline}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.desc}</p>
                <ul className="space-y-1.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-success shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A modular architecture</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every experience is built from independent blocks. The engine grows without rewrites.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="glass-strong rounded-2xl p-8">
                <div className="space-y-3">
                  {['Animation', 'Countdown', 'Video', 'Image', 'CTA', 'Buttons', 'Poll', 'Quiz', 'Scratch Card', 'Spin Wheel', 'Mini Game', 'AI Avatar', 'Audio', 'Confetti', 'Forms', 'Survey', 'Social Proof', 'Custom HTML'].map((block, i) => (
                    <div key={block} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="flex-1 rounded-lg bg-muted/50 px-3 py-1.5 text-sm font-medium">{block}</div>
                      <span className="text-xs text-muted-foreground">Block</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">New blocks can be installed from the marketplace without modifying the core engine.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="glass-strong rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Build the future of clicks</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join the platform that&apos;s defining a new category. Not a SaaS — an internet infrastructure platform.
            </p>
            <Link href="/login?mode=signup" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
              Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
