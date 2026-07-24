import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShortenerForm } from '@/components/shortener-form';
import Link from 'next/link';
import { BarChart3, QrCode, Shield, Clock, Globe, Zap, Link2, Sparkles, ArrowRight, Check } from 'lucide-react';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Shrtul',
  description: 'Fast, free, and smart URL shortener with QR codes, analytics, and custom aliases.',
  url: 'https://shrtul.com',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'URL shortening',
    'QR code generation',
    'Click analytics',
    'Password protected links',
    'Custom aliases',
    'Expiry dates',
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is Shrtul free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Shrtul is free forever. Guest links work without signup and expire after 24 hours. Registered users get permanent links for free.' } },
    { '@type': 'Question', name: 'Do I need to create an account?', acceptedAnswer: { '@type': 'Answer', text: 'No, you can shorten URLs as a guest without any registration. However, creating a free account gives you permanent links and advanced analytics.' } },
    { '@type': 'Question', name: 'Can I customize my short link?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, you can choose a custom alias for your short link, or let Shrtul generate a random one for you.' } },
    { '@type': 'Question', name: 'Can I track clicks on my links?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Shrtul provides detailed click analytics including geographic location, browser, device, and referrer data.' } },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden mesh-bg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 py-20 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Free forever — no signup required</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 animate-slide-up">
              Shorten links.<br />
              <span className="gradient-text">Track everything.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
              The premium URL shortener with QR codes, password protection, click analytics, and custom aliases. Free for guests, powerful for pros.
            </p>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <ShortenerForm />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> No registration needed</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Links expire in 24h (guest)</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Permanent for signed-in users</span>
            </div>
          </div>
        </section>

        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '<50ms', label: 'Redirect speed' },
                { value: '190+', label: 'Countries tracked' },
                { value: '∞', label: 'Free links' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Powerful features packed into a clean, fast interface.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Sub-50ms redirects with global edge caching. Your users never wait.' },
              { icon: BarChart3, title: 'Click Analytics', desc: 'Track clicks, devices, browsers, countries, and referrers in real-time.' },
              { icon: QrCode, title: 'QR Codes', desc: 'Generate beautiful QR codes for every short link. Perfect for print and offline.' },
              { icon: Shield, title: 'Password Protection', desc: 'Add a password to sensitive links. Only people with the key can access.' },
              { icon: Clock, title: 'Expiry Dates', desc: 'Set links to expire automatically. Great for campaigns and time-sensitive content.' },
              { icon: Globe, title: 'Custom Aliases', desc: 'Use your own branded short slugs. Make links memorable and trustworthy.' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
              <p className="text-lg text-muted-foreground">Three steps to shorter links.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Paste your URL', desc: 'Drop any long URL into the shortener box above.' },
                { step: '02', title: 'Customize', desc: 'Add a custom alias, password, or expiry date (optional).' },
                { step: '03', title: 'Share & track', desc: 'Copy your short link and watch the analytics roll in.' },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="text-6xl font-bold text-primary/20 mb-2">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple pricing</h2>
            <p className="text-lg text-muted-foreground">Free forever. Upgrade only if you need more.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect for casual users</p>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/forever</span></div>
              <ul className="space-y-3 mb-8">
                {['Guest links (24h expiry)', 'Custom aliases', 'QR codes', 'Click analytics', 'Password protection'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full h-11 rounded-lg border border-border bg-transparent hover:bg-muted text-foreground font-medium transition-all">
                  Get Started
                </button>
              </Link>
            </div>

            <div className="glass-strong rounded-2xl p-8 ring-2 ring-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For power users &amp; teams</p>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/forever</span></div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', 'Permanent links', 'Unlimited links', 'Advanced analytics', 'Expiry dates', 'UTM parameters'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all shadow-lg shadow-primary/25">
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="glass-strong rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ready to shorten?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of users creating smarter short links every day.</p>
            <Link href="/signup">
              <button className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
