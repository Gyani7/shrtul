import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface LandingPageProps {
  title: string;
  headline: string;
  subtitle: string;
  badge?: string;
  badgeIcon?: string;
  features: { icon: string; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  breadcrumbName: string;
  path: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
}

const ICONS: Record<string, typeof Sparkles> = {
  Sparkles, ArrowRight, Check,
};

export function createLandingPage(props: LandingPageProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${props.title} — Shrtul X`,
    description: props.subtitle,
    url: `https://shrtul.com${props.path}`,
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shrtul.com' },
      { '@type': 'ListItem', position: 2, name: props.breadcrumbName, item: `https://shrtul.com${props.path}` },
    ],
  };

  return function LandingPage() {
    return (
      <div className="min-h-screen flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <SiteHeader />
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 pt-6">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">{props.breadcrumbName}</span>
            </nav>
          </div>

          {/* Hero */}
          <section className="container mx-auto px-4 py-16 md:py-24 text-center">
            {props.badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {props.badge}
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              {props.headline.includes('Experience') || props.headline.includes('AI') ? (
                <>
                  {props.headline.split(' ').slice(0, -2).join(' ')}{' '}
                  <span className="gradient-text">{props.headline.split(' ').slice(-2).join(' ')}</span>
                </>
              ) : (
                <>
                  {props.headline.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="gradient-text">{props.headline.split(' ').slice(-1).join(' ')}</span>
                </>
              )}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              {props.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?mode=signup" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/dashboard/marketplace" className="inline-flex h-12 px-8 items-center justify-center rounded-xl border border-border hover:bg-muted text-foreground font-medium transition-all">
                Browse Templates
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {props.features.map((feature, i) => (
                <div key={feature.title} className="glass rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="border-y border-border/50 bg-card/30">
            <div className="container mx-auto px-4 py-16 md:py-24">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {props.faqs.map((faq) => (
                  <div key={faq.question} className="glass rounded-xl p-5">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 py-20 md:py-28">
            <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 -z-10 gradient-bg" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {props.ctaTitle || 'Ready to make every click count?'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {props.ctaSubtitle || 'Join thousands of users creating interactive link experiences every day.'}
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
  };
}
