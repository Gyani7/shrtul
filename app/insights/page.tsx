import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { InsightsDashboard } from '@/components/demo/insights-dashboard';
import Link from 'next/link';
import { BarChart3, ArrowRight, Brain, Eye, Target, TrendingUp, Zap, Globe, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shrtul Insights — AI Analytics Platform for Click Experiences',
  description: 'Go beyond click counting. Track attention, completion, drop-off, conversion, and engagement with AI-generated insights, funnel analysis, and predictive analytics.',
  alternates: { canonical: 'https://shrtul.com/insights' },
  openGraph: { title: 'Shrtul Insights — AI Analytics Platform', description: 'Advanced analytics for click experiences with AI insights.', url: 'https://shrtul.com/insights' },
};

const TRACKED = ['Click', 'Hover', 'Attention Time', 'Completion', 'Drop-off', 'Skip', 'Interaction', 'Replay', 'Conversion', 'CTR', 'Geo', 'Device', 'Browser', 'Language', 'Referral', 'Campaign', 'Funnels', 'AI Insights', 'Prediction Engine'];

const FEATURES = [
  { icon: Brain, title: 'AI-Generated Insights', desc: 'Instead of raw dashboards, get plain-language insights and recommendations from your data.' },
  { icon: Eye, title: 'Attention Tracking', desc: 'Track how long users pay attention, not just whether they clicked. Measure real engagement.' },
  { icon: Target, title: 'Funnel Analysis', desc: 'See where users drop off in the experience flow, from click to conversion.' },
  { icon: TrendingUp, title: 'Predictive Analytics', desc: 'AI predicts which experiences will perform best based on historical data.' },
];

export default function InsightsPage() {
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
              <BarChart3 className="h-3.5 w-3.5 text-primary" /> Shrtul Insights
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Analytics that think,<br />
              <span className="gradient-text">not just count.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              A complete AI analytics platform. Track 19+ metrics, see funnels, read AI-generated insights, and predict performance.
            </p>
          </div>
        </section>

        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Live Insights Dashboard</h2>
              <p className="text-sm text-muted-foreground">Real-time charts, funnels, radar, and AI-generated insights. This is a live dashboard.</p>
            </div>
            <InsightsDashboard />
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">19+ metrics tracked</h2>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {TRACKED.map((metric, i) => (
                <span key={metric} className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground animate-slide-up" style={{ animationDelay: `${i * 0.02}s` }}>
                  {metric}
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16">
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

        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <h2 className="text-3xl font-bold mb-4">Understand every click</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Get AI-powered insights from your click data, not just numbers.</p>
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
