import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { StudioBuilder } from '@/components/demo/studio-builder';
import Link from 'next/link';
import { Wand2, ArrowRight, Check, Sparkles, Layers, Eye, RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shrtul Studio — AI Experience Builder with Modular Blocks',
  description: 'Design interactive click experiences with a modular block system. Drag, drop, configure, and preview in real time. AI-generated experiences from natural language prompts.',
  alternates: { canonical: 'https://shrtul.com/studio' },
  openGraph: { title: 'Shrtul Studio — AI Experience Builder', description: 'Design interactive click experiences with modular blocks and AI.', url: 'https://shrtul.com/studio' },
};

const FEATURES = [
  { icon: Layers, title: 'Modular Block System', desc: 'Every experience is built from independent blocks — countdown, poll, game, CTA, video, and more. New blocks install from the marketplace.' },
  { icon: Eye, title: 'Live Preview', desc: 'See your experience update in real time as you build. No publish step needed to test.' },
  { icon: Sparkles, title: 'AI Experience Generator', desc: 'Describe your campaign in plain language and AI assembles the right blocks for you.' },
  { icon: RotateCcw, title: 'Version History', desc: 'Every change is versioned. Roll back to any previous version of your experience.' },
];

export default function StudioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden mesh-bg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
              <Wand2 className="h-3.5 w-3.5 text-primary" /> Shrtul Studio
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Design experiences,<br />
              <span className="gradient-text">not links.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              A modular block-based editor with live preview and AI generation. Build interactive click experiences the way you build in Figma.
            </p>
          </div>
        </section>

        {/* Interactive Studio Builder */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Try the Studio Builder</h2>
              <p className="text-sm text-muted-foreground">Add blocks, reorder them, edit properties, and watch the live preview. Or use AI to generate an experience from a prompt.</p>
            </div>
            <StudioBuilder />
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <h2 className="text-3xl font-bold mb-4">Start designing experiences</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Join the platform that turns every click into an interactive journey.</p>
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
