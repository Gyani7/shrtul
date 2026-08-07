'use client';

import { useLiveEngine } from '@/components/live-engine';
import { AnimatedCounter } from '@/components/live/animated-counter';
import { TrendingUp, Star } from 'lucide-react';

export function LiveTrendingTemplates() {
  const { trendingTemplates } = useLiveEngine();

  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
        </span>
        <h3 className="text-sm font-semibold">Trending Templates</h3>
      </div>

      <div className="space-y-2">
        {trendingTemplates.slice(0, 5).map((t, i) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
          >
            <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.category}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-semibold tabular-nums">
                <AnimatedCounter value={t.installs} format="compact" duration={600} />
              </div>
              {t.change > 0 && (
                <div className="flex items-center gap-0.5 text-[10px] text-success">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +{t.change}
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-warning shrink-0">
              <Star className="h-2.5 w-2.5 fill-warning" />
              {t.rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
