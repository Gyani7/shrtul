'use client';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShortenerForm } from '@/components/shortener-form';
import { InteractiveDemo } from '@/components/interactive-demo';
import { LiveStatsBar } from '@/components/live/live-stats-bar';
import { LiveWorldMap } from '@/components/live/world-map';
import { LiveActivityFeed } from '@/components/live/activity-feed';
import { LiveAIInsights } from '@/components/live/ai-insights';
import { LiveTrendingTemplates } from '@/components/live/trending-templates';
import { LiveExperienceGallery } from '@/components/live/experience-gallery';
import { useLiveEngine } from '@/components/live-engine';
import { AnimatedCounter } from '@/components/live/animated-counter';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Check, Zap, Brain, BarChart3, Globe, Smartphone,
  Timer, Gift, Disc, Bot, MousePointerClick, Smile, Play, Image as ImageIcon,
  HelpCircle, ClipboardList, Gamepad2, Store, Code2, Webhook, Puzzle,
  Megaphone, Users, Building2, Rocket, GraduationCap, CalendarDays, Terminal,
  TrendingUp, Eye, MapPin, Monitor, Clock, Target, Star, Quote,
  Wand2, Workflow, FlaskConical, Layers, Activity,
} from 'lucide-react';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Shrtul X',
  description: 'AI Click Experience Platform that transforms every link into an interactive journey with AI-powered experiences, gamified redirects, smart analytics, and a template marketplace.',
  url: 'https://shrtul.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'AI-powered click experiences',
    'Smart links with geo and device routing',
    'Interactive experiences (countdown, polls, spin wheel, mini games)',
    'Real-time analytics with engagement metrics',
    'Custom domains',
    'QR code generation',
    'Template marketplace',
    'Developer API and webhooks',
    'Team workspaces',
    'Password protection and expiry',
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is an AI Click Experience Platform?', acceptedAnswer: { '@type': 'Answer', text: 'Shrtul X is an AI Click Experience Platform that transforms ordinary URL redirects into interactive journeys. Instead of simply redirecting users, every click can include an experience like a countdown, poll, mini game, AI avatar, or call to action before reaching the destination.' } },
    { '@type': 'Question', name: 'How is Shrtul X different from a URL shortener?', acceptedAnswer: { '@type': 'Answer', text: 'Traditional URL shorteners only redirect. Shrtul X adds an interactive experience layer between the click and the redirect, tracks engagement metrics like completion rate and wait time, and offers AI-powered personalization, a template marketplace, and advanced analytics.' } },
    { '@type': 'Question', name: 'Can I use Shrtul X for free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Shrtul X is free forever. Guest links work without signup and expire after 24 hours. Registered users get permanent links, analytics, and access to experience templates at no cost.' } },
    { '@type': 'Question', name: 'What kind of experiences can I add to my links?', acceptedAnswer: { '@type': 'Answer', text: 'You can add countdowns, polls, quizzes, spin wheels, scratch cards, mini games, AI avatars, video interstitials, image reveals, memes, surveys, call-to-action screens, and loading animations. New templates are regularly added through the marketplace.' } },
    { '@type': 'Question', name: 'Does Shrtul X have a developer API?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Shrtul X provides a REST API and webhook system for creating links, tracking analytics, and integrating with external services. API keys can be generated from your workspace settings.' } },
  ],
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shrtul.com' },
  ],
};

const AI_FEATURES = [
  { icon: Brain, title: 'AI Personalization', desc: 'Automatically tailor the click experience based on visitor location, device, and behavior patterns.' },
  { icon: BarChart3, title: 'AI Analytics', desc: 'Get AI-generated insights and recommendations from your click data instead of raw numbers.' },
  { icon: Sparkles, title: 'AI Experience Builder', desc: 'Describe your campaign in plain language and AI generates the perfect experience configuration.' },
  { icon: Target, title: 'AI Recommendations', desc: 'Receive smart suggestions for improving engagement and conversion rates.' },
];

const ENTERPRISE_USE_CASES = [
  { icon: Megaphone, title: 'Marketing', desc: 'Create campaign links that engage before they redirect.' },
  { icon: Star, title: 'Creators', desc: 'Grow your audience with interactive link experiences.' },
  { icon: Building2, title: 'Brands', desc: 'Reinforce brand identity with custom-themed redirects.' },
  { icon: Rocket, title: 'Startups', desc: 'Launch products with countdown and teaser experiences.' },
  { icon: Users, title: 'Agencies', desc: 'Manage multiple clients with team workspaces.' },
  { icon: GraduationCap, title: 'Education', desc: 'Share resources with quiz and survey experiences.' },
  { icon: CalendarDays, title: 'Events', desc: 'Drive event registrations with countdown links.' },
  { icon: Terminal, title: 'Developers', desc: 'Build with our API, webhooks, and plugin system.' },
];

const TESTIMONIALS = [
  { quote: 'Shrtul X transformed our campaign links from boring redirects into engaging experiences. Our click-through rate jumped 40%.', author: 'Sarah Chen', role: 'Marketing Director', company: 'GrowthLab' },
  { quote: 'The AI experience builder saved us hours. We describe our campaign and get a ready-to-use interactive link.', author: 'Marcus Rodriguez', role: 'Growth Lead', company: 'StartupHub' },
  { quote: 'We use Shrtul X for all our event links. The countdown experience alone doubled our registration rate.', author: 'Priya Patel', role: 'Event Manager', company: 'TechConf' },
];

function LiveHeroBanner() {
  const { activeUsers, clicksLastMinute, aiExperiencesToday } = useLiveEngine();
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-muted-foreground">
          <AnimatedCounter value={activeUsers} format="number" /> users creating experiences right now
        </span>
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-warning" />
        <AnimatedCounter value={clicksLastMinute} format="number" /> clicks in the last minute
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Bot className="h-3.5 w-3.5 text-primary" />
        AI generated <AnimatedCounter value={aiExperiencesToday} format="number" /> experiences today
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden mesh-bg">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
            <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
          </div>
          <div className="absolute inset-0 hero-grid -z-10" />

          <div className="container mx-auto px-4 py-20 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-8 animate-fade-in backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>The AI Click Experience Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 animate-slide-up">
              Every Click Deserves<br />
              <span className="gradient-text">an Experience.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Transform every link into an interactive journey. AI-powered experiences, gamified redirects, and smart analytics — not just another shortener.
            </p>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="max-w-2xl mx-auto mb-6">
                <ShortenerForm />
              </div>
            </div>

            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <LiveHeroBanner />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> No registration needed</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> AI-powered experiences</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Real-time analytics</span>
            </div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <section className="border-b border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-8">
            <LiveStatsBar />
          </div>
        </section>

        {/* Live World Map + Activity Feed */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Activity className="h-3.5 w-3.5" /> Live Activity
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Watch the internet in action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every dot is a real click happening somewhere in the world. Every pulse is an experience being served.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-2">
              <LiveWorldMap />
            </div>
            <div>
              <LiveActivityFeed max={8} />
            </div>
          </div>
        </section>

        {/* Live Experience Gallery */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Experience Engine
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">12 ways to engage every click</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don&apos;t just read about it. Click any card to launch a real, working experience right now.
              </p>
            </div>
            <LiveExperienceGallery />
          </div>
        </section>

        {/* Interactive Live Demo */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Experience it yourself</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don&apos;t just read about it. Try a live click experience right now.
            </p>
          </div>
          <InteractiveDemo />
        </section>

        {/* Live AI Insights */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <Brain className="h-3.5 w-3.5" /> AI Engine
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">AI that never stops watching</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI continuously analyzes your traffic and surfaces insights as they happen. No dashboards to check — the intelligence comes to you.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <LiveAIInsights />
            </div>
          </div>
        </section>

        {/* Trending Templates + AI Features */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div>
              <LiveTrendingTemplates />
            </div>
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-4">
                {AI_FEATURES.map((feature, i) => (
                  <div
                    key={feature.title}
                    className="glass-strong rounded-2xl p-6 card-hover animate-slide-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shrink-0">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Use Cases */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built for every team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From solo creators to enterprise teams, Shrtul X scales with your needs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {ENTERPRISE_USE_CASES.map((useCase, i) => (
                <div
                  key={useCase.title}
                  className="glass rounded-xl p-5 card-hover animate-slide-up"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                    <useCase.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{useCase.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{useCase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ecosystem Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Layers className="h-3.5 w-3.5" /> Ecosystem
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Not one app. An entire ecosystem.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Six products, one platform, one mission. Each is powerful alone — together they form a complete operating system for every click.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { href: '/studio', icon: Wand2, name: 'Shrtul Studio', desc: 'AI Experience Builder with modular blocks and live preview.', color: 'from-primary to-accent' },
              { href: '/flow', icon: Workflow, name: 'Shrtul Flow', desc: 'Visual automation engine for click-based workflows.', color: 'from-accent to-success' },
              { href: '/insights', icon: BarChart3, name: 'Shrtul Insights', desc: 'AI analytics with 19+ metrics and predictive insights.', color: 'from-primary to-primary' },
              { href: '/market', icon: Store, name: 'Shrtul Market', desc: 'Experience marketplace — publish, sell, fork, install.', color: 'from-accent to-primary' },
              { href: '/labs', icon: FlaskConical, name: 'Shrtul Labs', desc: 'Experimental features: AI voice, AR redirects, more.', color: 'from-success to-accent' },
              { href: '/developer-api', icon: Code2, name: 'Shrtul Developer', desc: 'REST API, SDKs, webhooks, and plugin system.', color: 'from-primary to-accent' },
            ].map((product, i) => (
              <Link key={product.href} href={product.href} className="group glass-strong rounded-2xl p-6 card-hover animate-slide-up block" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${product.color} text-white shadow-lg mb-4`}>
                  <product.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{product.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/platform" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              View the full platform <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* API Section */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                  <Code2 className="h-3.5 w-3.5" /> Developer API
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Build with our API</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Create links, track analytics, and dispatch webhooks programmatically. Everything you can do in the dashboard, you can do via API.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'REST API with API key authentication',
                    'Webhook events for real-time integrations',
                    'Plugin system for custom extensions',
                    'Comprehensive API documentation',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/developer-api" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                  Explore the API <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="glass-strong rounded-2xl p-6 overflow-x-auto">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-error/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">create-link.ts</span>
                </div>
                <pre className="text-xs font-mono leading-relaxed text-muted-foreground">
{`const res = await fetch('/api/links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com/long',
    alias: 'my-link',
    experience_type: 'countdown',
    experience_config: {
      duration: 5,
      message: 'Redirecting...'
    },
    utm_source: 'newsletter',
  }),
});

const { short_url } = await res.json();`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Loved by teams worldwide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 max-w-3xl mx-auto">
              {[
                { value: '50K+', label: 'Links created' },
                { value: '2M+', label: 'Clicks tracked' },
                { value: '190+', label: 'Countries' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={testimonial.author} className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-medium">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="glass-strong rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 gradient-bg" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-primary/20 blur-3xl" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to make every click count?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users creating interactive link experiences every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?mode=signup" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/dashboard/marketplace" className="inline-flex h-12 px-8 items-center justify-center rounded-xl border border-border bg-transparent hover:bg-muted text-foreground font-medium transition-all">
                Browse Templates
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
