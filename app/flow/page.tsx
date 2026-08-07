import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FlowBuilder } from '@/components/demo/flow-builder';
import Link from 'next/link';
import { Workflow, ArrowRight, Zap, GitBranch, Calendar, Webhook, Bell } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shrtul Flow — Visual Automation & Workflow Engine',
  description: 'Build visual workflows that trigger experiences based on conditions. If Instagram click then gaming experience. If country is India then Hindi theme. Visual automation for every click.',
  alternates: { canonical: 'https://shrtul.com/flow' },
  openGraph: { title: 'Shrtul Flow — Automation & Workflow Engine', description: 'Visual workflow builder for click experiences.', url: 'https://shrtul.com/flow' },
};

const FEATURES = [
  { icon: Zap, title: 'Triggers', desc: 'Link clicks, Instagram clicks, returning visitors, time of day, weekends — anything can trigger a workflow.' },
  { icon: GitBranch, title: 'Conditions', desc: 'Route users by country, device, language, visit history, or any custom condition you define.' },
  { icon: Calendar, title: 'Schedules', desc: 'Run festival themes on holidays, gaming themes on weekends, or business themes during work hours.' },
  { icon: Webhook, title: 'Webhooks & Events', desc: 'Send webhooks, notifications, and emails when workflows execute. Connect to any external service.' },
];

export default function FlowPage() {
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
              <Workflow className="h-3.5 w-3.5 text-primary" /> Shrtul Flow
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              If this click,<br />
              <span className="gradient-text">then that experience.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              A visual workflow engine that triggers the right experience for every visitor. No code, no rules engine — just drag, connect, and run.
            </p>
          </div>
        </section>

        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Try the Flow Builder</h2>
              <p className="text-sm text-muted-foreground">Add triggers, conditions, and actions. Click Run Workflow to see it execute step by step.</p>
            </div>
            <FlowBuilder />
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
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
            <h2 className="text-3xl font-bold mb-4">Automate every click</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Build workflows that adapt experiences to every visitor automatically.</p>
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
