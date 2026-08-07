'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  Link2,
  LinkIcon,
  Unlink,
  MousePointerClick,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Crown,
} from 'lucide-react';
import { formatNumber, formatDate, timeAgo } from '@/lib/utils';
import { AdminNotifications } from '@/components/admin-notifications';

interface Stats {
  total_users: number;
  active_users_30d: number;
  total_links: number;
  active_links: number;
  expired_links: number;
  disabled_links: number;
  guest_links: number;
  permanent_links: number;
  total_clicks: number;
  clicks_today: number;
  expiring_links: number;
  top_users: { id: string; email: string; full_name: string; total_clicks: number; total_links: number }[];
  top_links: { id: string; alias: string; destination_url: string; total_clicks: number; created_at: string }[];
  clicks_timeline: { date: string; clicks: number }[];
  registrations_timeline: { date: string; count: number }[];
  links_by_month: { month: string; count: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Users (30d)', value: stats?.active_users_30d || 0, icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Links', value: stats?.total_links || 0, icon: Link2, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Active Links', value: stats?.active_links || 0, icon: LinkIcon, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Expired Links', value: stats?.expired_links || 0, icon: Unlink, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Disabled Links', value: stats?.disabled_links || 0, icon: Unlink, color: 'text-muted-foreground', bg: 'bg-muted' },
    { label: 'Total Clicks', value: stats?.total_clicks || 0, icon: MousePointerClick, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Clicks Today', value: stats?.clicks_today || 0, icon: Calendar, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and analytics</p>
      </div>

      {(stats?.expiring_links || 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning">
            <span className="font-semibold">{stats?.expiring_links}</span> link{stats?.expiring_links !== 1 ? 's' : ''} expiring within 24 hours
          </p>
        </div>
      )}

      <AdminNotifications />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className="p-4 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{formatNumber(card.value)}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Daily Clicks (30 days)</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <MiniChart data={stats?.clicks_timeline?.map((d) => d.clicks) || []} labels={stats?.clicks_timeline?.map((d) => d.date) || []} color="hsl(var(--primary))" />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">User Registrations (30 days)</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <MiniChart data={stats?.registrations_timeline?.map((d) => d.count) || []} labels={stats?.registrations_timeline?.map((d) => d.date) || []} color="hsl(var(--success))" />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Monthly Link Growth</h3>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <BarChart data={stats?.links_by_month?.map((d) => d.count) || []} labels={stats?.links_by_month?.map((d) => d.month) || []} color="hsl(var(--accent))" />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Link Status Breakdown</h3>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <DonutChart
            segments={[
              { label: 'Active', value: stats?.active_links || 0, color: 'hsl(var(--success))' },
              { label: 'Expired', value: stats?.expired_links || 0, color: 'hsl(var(--error))' },
              { label: 'Disabled', value: stats?.disabled_links || 0, color: 'hsl(var(--muted-foreground))' },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">Top Users by Clicks</h3>
          </div>
          <div className="space-y-2">
            {(stats?.top_users || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              (stats?.top_users || []).slice(0, 10).map((user, i) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatNumber(user.total_clicks)}</p>
                    <p className="text-xs text-muted-foreground">{user.total_links} links</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Top Links by Clicks</h3>
          </div>
          <div className="space-y-2">
            {(stats?.top_links || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              (stats?.top_links || []).slice(0, 10).map((link, i) => (
                <div key={link.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono font-medium truncate">/{link.alias}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.destination_url}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatNumber(link.total_clicks)}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(link.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>;
  }

  const max = Math.max(...data, 1);
  const width = 100;
  const height = 120;
  const step = width / Math.max(data.length - 1, 1);

  const points = data.map((v, i) => `${i * step},${height - (v / max) * height}`);
  const path = `M ${points.join(' L ')}`;
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
        <path d={areaPath} fill={color} opacity={0.15} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{labels[0] ? formatDate(labels[0]) : ''}</span>
        <span>{labels[labels.length - 1] ? formatDate(labels[labels.length - 1]) : ''}</span>
      </div>
    </div>
  );
}

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>;
  }

  const max = Math.max(...data, 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t" style={{ height: `${(v / max) * 100}%`, backgroundColor: color, minHeight: '2px' }} />
            <span className="text-xs text-muted-foreground">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>;
  }

  let offset = 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const dash = fraction * circumference;
          const circle = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm font-medium">{seg.label}</span>
            <span className="text-sm text-muted-foreground">{formatNumber(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
