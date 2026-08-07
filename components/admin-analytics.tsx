'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface AnalyticsData {
  daily: { date: string; clicks: number; links: number }[];
  total_clicks: number;
  total_links: number;
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => setData(data))
      .finally(() => setLoading(false));
  }, []);

  const daily = data?.daily || [];
  const maxClicks = Math.max(...daily.map(d => d.clicks), 1);
  const maxLinks = Math.max(...daily.map(d => d.links), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform-wide analytics (last 30 days)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{loading ? '...' : formatNumber(data?.total_clicks || 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Clicks (30d)</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{loading ? '...' : formatNumber(data?.total_links || 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Links (30d)</div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Daily Clicks</CardTitle></CardHeader>
        {daily.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No data yet</p>
        ) : (
          <div className="flex items-end gap-1 h-48 px-2">
            {daily.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full rounded-t bg-primary/80 hover:bg-primary transition-all relative" style={{ height: `${(d.clicks / maxClicks) * 100}%`, minHeight: '4px' }}>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.clicks}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate w-full text-center">{d.date}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>Daily New Links</CardTitle></CardHeader>
        {daily.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No data yet</p>
        ) : (
          <div className="flex items-end gap-1 h-48 px-2">
            {daily.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full rounded-t bg-accent/80 hover:bg-accent transition-all relative" style={{ height: `${(d.links / maxLinks) * 100}%`, minHeight: '4px' }}>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.links}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate w-full text-center">{d.date}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
