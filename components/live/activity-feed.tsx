'use client';

import { useLiveEngine } from '@/components/live-engine';
import { MousePointerClick, Link2, Download, Upload, Bot, UserPlus, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  click: MousePointerClick,
  create: Link2,
  install: Download,
  publish: Upload,
  ai: Bot,
  signup: UserPlus,
};

const COLORS: Record<string, string> = {
  click: 'text-primary bg-primary/10',
  create: 'text-accent bg-accent/10',
  install: 'text-success bg-success/10',
  publish: 'text-warning bg-warning/10',
  ai: 'text-primary bg-primary/10',
  signup: 'text-accent bg-accent/10',
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function LiveActivityFeed({ max = 8 }: { max?: number }) {
  const { activity } = useLiveEngine();

  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <h3 className="text-sm font-semibold">Live Activity</h3>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
        {activity.slice(0, max).map((item, i) => {
          const Icon = ICONS[item.type] || MousePointerClick;
          const color = COLORS[item.type] || 'text-muted-foreground bg-muted';
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.message}</p>
                <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                {timeAgo(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
