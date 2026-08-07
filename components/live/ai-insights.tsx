'use client';

import { useLiveEngine } from '@/components/live-engine';
import { TrendingUp, Smartphone, Sparkles, Target, Zap, Globe, BarChart3, Brain, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'trending-up': TrendingUp,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  zap: Zap,
  globe: Globe,
  'bar-chart': BarChart3,
  brain: Brain,
};

export function LiveAIInsights() {
  const { insights } = useLiveEngine();

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => {
        const Icon = ICONS[insight.icon] || Brain;
        return (
          <div
            key={insight.id}
            className="glass rounded-xl p-4 flex items-start gap-3 animate-fade-in card-hover"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary">AI</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{insight.confidence}% confidence</span>
              </div>
              <p className="text-sm font-medium leading-snug">{insight.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{insight.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
