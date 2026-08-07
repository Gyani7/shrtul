import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Link Marketing, AI Marketing & Conversion Optimization',
  description: 'Learn how to use interactive links, AI-powered experiences, and click analytics to grow your audience and increase conversions.',
  alternates: { canonical: 'https://shrtul.com/blog' },
  openGraph: { title: 'Blog — Shrtul X', description: 'Link marketing, AI marketing, and conversion optimization articles.', url: 'https://shrtul.com/blog' },
};

const CATEGORIES = [
  { name: 'Link Marketing', desc: 'Strategies for using interactive links in your marketing campaigns.', count: 8 },
  { name: 'QR Code Marketing', desc: 'How to use QR code experiences for offline-to-online engagement.', count: 5 },
  { name: 'Creator Growth', desc: 'Grow your audience with interactive link experiences.', count: 6 },
  { name: 'AI Marketing', desc: 'Leverage AI to personalize and optimize every click.', count: 4 },
  { name: 'Digital Campaigns', desc: 'Plan and execute digital campaigns with smart links.', count: 7 },
  { name: 'Conversion Optimization', desc: 'Turn clicks into conversions with engagement-first analytics.', count: 9 },
  { name: 'Social Media Growth', desc: 'Use interactive links to grow on social platforms.', count: 5 },
  { name: 'WhatsApp Marketing', desc: 'Share interactive links on WhatsApp and messaging apps.', count: 3 },
  { name: 'Instagram Marketing', desc: 'Drive engagement from Instagram with link experiences.', count: 4 },
  { name: 'Link Analytics', desc: 'Understand your audience with advanced link analytics.', count: 6 },
  { name: 'Interactive Marketing', desc: 'The future of interactive and gamified marketing.', count: 5 },
  { name: 'User Engagement', desc: 'Strategies to maximize user engagement on every click.', count: 7 },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
            <Newspaper className="h-3.5 w-3.5 text-primary" />
            Content Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Insights for the<br />
            <span className="gradient-text">click experience era</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 text-balance">
            Learn how to use interactive links, AI-powered experiences, and click analytics to grow your audience and increase conversions.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-20 md:pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/blog/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="glass rounded-xl p-5 card-hover animate-slide-up group"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold">{cat.name}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                <span className="text-xs text-muted-foreground/60">{cat.count} articles</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
