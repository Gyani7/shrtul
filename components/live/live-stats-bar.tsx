'use client';

import { useLiveEngine } from '@/components/live-engine';
import { AnimatedCounter } from '@/components/live/animated-counter';
import { Users, MousePointerClick, Link2, Bot, Globe, Sparkles, type LucideIcon } from 'lucide-react';

interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  format: 'number' | 'compact';
}

const STATS: StatConfig[] = [
  { key: 'activeUsers', label: 'Active Users', icon: Users, color: 'text-primary', bg: 'bg-primary/10', format: 'number' },
  { key: 'clicksLastMinute', label: 'Clicks / Min', icon: MousePointerClick, color: 'text-accent', bg: 'bg-accent/10', format: 'number' },
  { key: 'totalLinks', label: 'Total Links', icon: Link2, color: 'text-success', bg: 'bg-success/10', format: 'compact' },
  { key: 'aiExperiencesToday', label: 'AI Experiences Today', icon: Bot, color: 'text-warning', bg: 'bg-warning/10', format: 'number' },
  { key: 'countriesActive', label: 'Countries', icon: Globe, color: 'text-primary', bg: 'bg-primary/10', format: 'number' },
  { key: 'totalClicks', label: 'Total Clicks', icon: Sparkles, color: 'text-accent', bg: 'bg-accent/10', format: 'compact' },
];

export function LiveStatsBar() {
  const engine = useLiveEngine();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {STATS.map((stat) => {
        const value = (engine as unknown as Record<string, number>)[stat.key];
        return (
          <div key={stat.key} className="glass rounded-xl p-4 text-center card-hover">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} ${stat.color} mx-auto mb-2`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold tabular-nums">
              <AnimatedCounter value={value} format={stat.format} duration={800} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
