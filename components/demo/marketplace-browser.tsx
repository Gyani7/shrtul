'use client';

import { useState } from 'react';
import { Store, ArrowRight, Check, Sparkles, Puzzle, Zap, Globe, Timer, MousePointerClick, Loader, Disc, Gift, Bot, Smile, Gamepad2, HelpCircle, ClipboardList, Play, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
  icon: typeof Timer;
  desc: string;
  installs: number;
  rating: number;
  featured?: boolean;
}

const TEMPLATES: Template[] = [
  { id: 'countdown', name: 'Countdown Timer', category: 'Engagement', icon: Timer, desc: 'Build anticipation before redirect', installs: 12400, rating: 4.8, featured: true },
  { id: 'cta', name: 'Smart CTA', category: 'Conversion', icon: MousePointerClick, desc: 'Bold call-to-action before redirect', installs: 9800, rating: 4.7 },
  { id: 'loading', name: 'Loading Animation', category: 'Engagement', icon: Loader, desc: 'Branded loading screen', installs: 7600, rating: 4.6 },
  { id: 'poll', name: 'Quick Poll', category: 'Informational', icon: ClipboardList, desc: 'One-question poll before redirect', installs: 5200, rating: 4.5 },
  { id: 'spin', name: 'Spin the Wheel', category: 'Fun', icon: Disc, desc: 'Interactive spin wheel with prizes', installs: 8900, rating: 4.9, featured: true },
  { id: 'quiz', name: 'Quick Quiz', category: 'Informational', icon: HelpCircle, desc: 'Single-question quiz with reveal', installs: 3400, rating: 4.4 },
  { id: 'scratch', name: 'Scratch Card', category: 'Fun', icon: Gift, desc: 'Scratch-to-reveal promotion card', installs: 6700, rating: 4.8 },
  { id: 'meme', name: 'Meme Screen', category: 'Fun', icon: Smile, desc: 'Show a funny meme before redirect', installs: 11200, rating: 4.7, featured: true },
  { id: 'video', name: 'Video Interstitial', category: 'Engagement', icon: Play, desc: 'Play a short video before redirect', installs: 4500, rating: 4.5 },
  { id: 'reveal', name: 'Image Reveal', category: 'Engagement', icon: ImageIcon, desc: 'Full-screen image with tap-to-reveal', installs: 3800, rating: 4.4 },
  { id: 'avatar', name: 'AI Avatar', category: 'Conversion', icon: Bot, desc: 'AI avatar delivers a message', installs: 2900, rating: 4.6 },
  { id: 'game', name: 'Mini Game', category: 'Fun', icon: Gamepad2, desc: 'Simple tap-based mini game', installs: 6100, rating: 4.8 },
];

const PLUGINS = [
  { name: 'Slack Notifications', desc: 'Send click events to Slack', icon: Zap, installs: 3400 },
  { name: 'Google Analytics', desc: 'Push events to GA4', icon: Sparkles, installs: 8900 },
  { name: 'Zapier Webhook', desc: 'Connect to 5000+ apps', icon: Puzzle, installs: 5600 },
];

const THEMES = [
  { name: 'Cyber Neon', desc: 'Futuristic neon theme', icon: Globe, installs: 4200 },
  { name: 'Festival', desc: 'Celebration theme', icon: Smile, installs: 3100 },
  { name: 'Gaming', desc: 'Gamer aesthetic', icon: Gamepad2, installs: 3800 },
];

const CATEGORIES = ['All', 'Engagement', 'Fun', 'Conversion', 'Informational'];

export function MarketplaceBrowser() {
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState<'templates' | 'plugins' | 'themes'>('templates');
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  const filtered = category === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  const toggleInstall = (id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Store className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Template Marketplace</h3>
      </div>

      <div className="flex gap-2 mb-4">
        {(['templates', 'plugins', 'themes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                  category === cat ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((template) => (
              <div key={template.id} className="rounded-xl border border-border bg-card p-4 card-hover">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <template.icon className="h-4 w-4" />
                  </div>
                  {template.featured && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Featured</span>
                  )}
                </div>
                <h4 className="text-sm font-semibold mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{template.desc}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{template.installs.toLocaleString()} installs</span>
                  <span className="flex items-center gap-1">
                    <span className="text-warning">{'\u2605'}</span> {template.rating}
                  </span>
                </div>
                <button
                  onClick={() => toggleInstall(template.id)}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors',
                    installed.has(template.id)
                      ? 'bg-success/10 text-success border border-success/30'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {installed.has(template.id) ? (
                    <><Check className="h-3.5 w-3.5" /> Installed</>
                  ) : (
                    <>Install <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'plugins' && (
        <div className="grid md:grid-cols-3 gap-3">
          {PLUGINS.map((plugin) => (
            <div key={plugin.name} className="rounded-xl border border-border bg-card p-4 card-hover">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent mb-3">
                <plugin.icon className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold mb-1">{plugin.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{plugin.desc}</p>
              <p className="text-xs text-muted-foreground mb-3">{plugin.installs.toLocaleString()} installs</p>
              <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Install <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'themes' && (
        <div className="grid md:grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <div key={theme.name} className="rounded-xl border border-border bg-card p-4 card-hover">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <theme.icon className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold mb-1">{theme.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{theme.desc}</p>
              <p className="text-xs text-muted-foreground mb-3">{theme.installs.toLocaleString()} installs</p>
              <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Apply Theme <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
