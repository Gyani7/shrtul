import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { FlaskConical, ArrowRight, Bot, Mic, Camera, ScanLine, Brain, Zap, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shrtul Labs — Experimental Features & Future of Click Experiences',
  description: 'Try cutting-edge experimental features before they ship: AI voice experiences, AR redirects, camera-based interactions, and more. The future of clicks starts here.',
  alternates: { canonical: 'https://shrtul.com/labs' },
  openGraph: { title: 'Shrtul Labs — Experimental Features', description: 'Try the future of click experiences before they ship.', url: 'https://shrtul.com/labs' },
};

const EXPERIMENTS = [
  { icon: Mic, title: 'AI Voice Experiences', desc: 'AI-generated voice messages that play before redirecting. Personalized for each visitor.', status: 'Alpha', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Camera, title: 'Camera Interactions', desc: 'Use device camera for AR-based experiences. Point at a product to unlock content.', status: 'Research', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: ScanLine, title: 'AR Redirects', desc: 'Augmented reality overlays on top of QR code scans. Interactive 3D experiences.', status: 'Prototype', color: 'text-success', bg: 'bg-success/10' },
  { icon: Brain, title: 'Predictive Personalization', desc: 'AI predicts the best experience for each visitor before they even click.', status: 'Beta', color: 'text-warning', bg: 'bg-warning/10' },
  { icon: Bot, title: 'AI Avatar Studio', desc: 'Create custom AI avatars that deliver personalized messages in your brand voice.', status: 'Alpha', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Zap, title: 'Instant Experiences', desc: 'Pre-rendered experiences that load in under 100ms. Zero-latency redirects.', status: 'Beta', color: 'text-accent', bg: 'bg-accent/10' },
];

const STATUS_COLORS: Record<string, string> = {
  Alpha: 'bg-primary/10 text-primary',
  Beta: 'bg-accent/10 text-accent',
  Prototype: 'bg-warning/10 text-warning',
  Research: 'bg-muted text-muted-foreground',
};

export default function LabsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden mesh-bg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-success/20 blur-3xl animate-float-slow" />
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6 backdrop-blur-sm">
              <FlaskConical className="h-3.5 w-3.5 text-primary" /> Shrtul Labs
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              The future of clicks,<br />
              <span className="gradient-text">today.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              Experimental features that push the boundaries of what a click experience can be. Try them before they ship to everyone.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {EXPERIMENTS.map((exp, i) => (
              <div key={exp.title} className="glass-strong rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${exp.bg} ${exp.color}`}>
                    <exp.icon className="h-6 w-6" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[exp.status]}`}>{exp.status}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{exp.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{exp.desc}</p>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Sparkles className="h-3.5 w-3.5" /> Request access
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <h2 className="text-3xl font-bold mb-4">Shape the future</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Join Labs to get early access to experimental features and help shape the platform.</p>
            <Link href="/login?mode=signup" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
              Join Labs <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
