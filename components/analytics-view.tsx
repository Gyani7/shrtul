'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { BarChart3, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { Link } from '@/lib/types';

interface AnalyticsViewProps {
  links: Link[];
  clicks: { created_at: string; country: string; browser: string; device: string; os: string; referer: string }[];
}

export function AnalyticsView({ links, clicks }: AnalyticsViewProps) {
  const totalClicks = clicks.length;

  const countries: Record<string, number> = {};
  const browsers: Record<string, number> = {};
  const devices: Record<string, number> = {};
  const oses: Record<string, number> = {};
  const daily: Record<string, number> = {};

  clicks.forEach((c) => {
    if (c.country) countries[c.country] = (countries[c.country] || 0) + 1;
    if (c.browser) browsers[c.browser] = (browsers[c.browser] || 0) + 1;
    if (c.device) devices[c.device] = (devices[c.device] || 0) + 1;
    if (c.os) oses[c.os] = (oses[c.os] || 0) + 1;
    const day = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    daily[day] = (daily[day] || 0) + 1;
  });

  const dailyEntries = Object.entries(daily).slice(-14).reverse();
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1);

  const deviceIcons: Record<string, typeof Monitor> = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Understand your audience</p>
      </div>

      {totalClicks === 0 ? (
        <Card className="text-center py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No clicks yet. Share your links to see analytics!</p>
        </Card>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-2xl font-bold">{formatNumber(totalClicks)}</div><div className="text-xs text-muted-foreground mt-1">Total Clicks</div></Card>
            <Card className="p-4"><div className="text-2xl font-bold">{formatNumber(links.length)}</div><div className="text-xs text-muted-foreground mt-1">Total Links</div></Card>
            <Card className="p-4"><div className="text-2xl font-bold">{Object.keys(countries).length}</div><div className="text-xs text-muted-foreground mt-1">Countries</div></Card>
            <Card className="p-4"><div className="text-2xl font-bold">{Object.keys(browsers).length}</div><div className="text-xs text-muted-foreground mt-1">Browsers</div></Card>
          </div>

          {/* Daily clicks chart */}
          <Card>
            <CardHeader><CardTitle>Daily Clicks (Last 14 Days)</CardTitle></CardHeader>
            <div className="flex items-end gap-1 h-48 px-2">
              {dailyEntries.map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full rounded-t bg-primary/80 hover:bg-primary transition-all relative" style={{ height: `${(val / maxDaily) * 100}%`, minHeight: '4px' }}>
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-full text-center">{day}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top links */}
            <Card>
              <CardHeader><CardTitle>Top Links</CardTitle></CardHeader>
              <div className="space-y-2">
                {links.slice(0, 5).map((link) => (
                  <div key={link.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">/{link.alias}</span>
                    <span className="font-medium">{formatNumber(link.total_clicks)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Countries */}
            <Card>
              <CardHeader><CardTitle>Top Countries</CardTitle></CardHeader>
              <Breakdown data={countries} icon={Globe} />
            </Card>

            {/* Browsers */}
            <Card>
              <CardHeader><CardTitle>Browsers</CardTitle></CardHeader>
              <Breakdown data={browsers} />
            </Card>

            {/* Devices */}
            <Card>
              <CardHeader><CardTitle>Devices</CardTitle></CardHeader>
              <div className="space-y-2">
                {Object.entries(devices).sort((a, b) => b[1] - a[1]).map(([device, val]) => {
                  const Icon = deviceIcons[device] || Monitor;
                  return (
                    <div key={device} className="flex items-center gap-3 text-sm">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{device}</span>
                      <span className="font-medium">{val}</span>
                      <span className="text-xs text-muted-foreground">{((val / totalClicks) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Breakdown({ data, icon: Icon }: { data: Record<string, number>; icon?: typeof Globe }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = entries[0]?.[1] || 1;
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No data</p>;
  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-2 text-sm">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="w-24 truncate">{key}</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(val / max) * 100}%` }} />
          </div>
          <span className="w-12 text-right text-muted-foreground text-xs">{((val / total) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
