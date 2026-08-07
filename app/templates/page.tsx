import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { ArrowRight, Sparkles, Timer, MousePointerClick, Loader, BarChart3, Disc, HelpCircle, Gift, ClipboardList, Smile, Play, Image as ImageIcon, Bot, Gamepad2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Experience Templates — Browse & Install Interactive Link Experiences',
  description: 'Browse 13+ experience templates for your links. Countdowns, polls, quizzes, spin wheels, scratch cards, mini games, AI avatars, and more.',
  alternates: { canonical: 'https://shrtul.com/templates' },
  openGraph: { title: 'Experience Templates — Shrtul X', description: 'Browse 13+ experience templates for your links.', url: 'https://shrtul.com/templates' },
};

const TEMPLATES = [
  { icon: Timer, name: 'Countdown Timer', category: 'Engagement', desc: 'Show a countdown before redirecting.' },
  { icon: MousePointerClick, name: 'Call to Action', category: 'Conversion', desc: 'Display a bold CTA button before redirect.' },
  { icon: Loader, name: 'Loading Animation', category: 'Engagement', desc: 'Play a branded loading animation.' },
  { icon: BarChart3, name: 'Quick Poll', category: 'Informational', desc: 'Ask a one-question poll before redirect.' },
  { icon: Disc, name: 'Spin the Wheel', category: 'Fun', desc: 'Interactive spin wheel with prizes.' },
  { icon: HelpCircle, name: 'Quick Quiz', category: 'Informational', desc: 'Single-question quiz with answer reveal.' },
  { icon: Gift, name: 'Scratch Card', category: 'Fun', desc: 'Interactive scratch-to-reveal card.' },
  { icon: ClipboardList, name: 'Mini Survey', category: 'Informational', desc: 'Multi-question survey before redirect.' },
  { icon: Smile, name: 'Meme Screen', category: 'Fun', desc: 'Show a funny meme before redirect.' },
  { icon: Play, name: 'Video Interstitial', category: 'Engagement', desc: 'Play a short video before redirect.' },
  { icon: ImageIcon, name: 'Image Reveal', category: 'Engagement', desc: 'Display a full-screen image before redirect.' },
  { icon: Bot, name: 'AI Avatar', category: 'Conversion', desc: 'AI avatar delivers a message before redirect.' },
  { icon: Gamepad2, name: 'Mini Game', category: 'Fun', desc: 'Simple tap-based mini game before redirect.' },
];

const CATEGORIES = ['All', 'Engagement', 'Fun', 'Conversion', 'Informational'];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Experience Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            13+ templates to make<br />
            <span className="gradient-text">every click count</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            Browse and install interactive experience templates for your links. Free for all users.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-20 md:pb-28">
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {TEMPLATES.map((template, i) => (
              <div key={template.name} className="glass rounded-xl p-5 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <template.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{template.name}</h3>
                    <span className="text-xs text-muted-foreground">{template.category}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{template.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              Browse in Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
