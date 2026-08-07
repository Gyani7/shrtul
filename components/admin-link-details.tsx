'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ExternalLink,
  QrCode,
  Trash2,
  MousePointerClick,
  Clock,
  Calendar,
  User,
  Globe,
  Monitor,
  Chrome,
  MapPin,
  Link2,
  Activity,
} from 'lucide-react';
import { formatNumber, formatDateTime, timeAgo, truncate } from '@/lib/utils';

interface LinkDetail {
  link: any;
  analytics: {
    device: { name: string; count: number }[];
    browser: { name: string; count: number }[];
    os: { name: string; count: number }[];
    country: { name: string; count: number }[];
    city: { name: string; count: number }[];
    referer: { name: string; count: number }[];
    timeline: { date: string; clicks: number }[];
    recent_clicks: any[];
  };
}

export function AdminLinkDetails({ linkId }: { linkId: string }) {
  const router = useRouter();
  const [data, setData] = useState<LinkDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/links/${linkId}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [linkId]);

  const handleDelete = async () => {
    if (!confirm('Delete this link permanently?')) return;
    const res = await fetch(`/api/admin/links?id=${linkId}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/links');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data || !data.link) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Link not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/links')}>
          Back to Links
        </Button>
      </div>
    );
  }

  const { link, analytics } = data;
  const shortUrl = `/${link.alias}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/links')}>
          <ArrowLeft className="h-4 w-4" /> Back to Links
        </Button>
        <div className="flex items-center gap-2">
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" /> Open
            </Button>
          </a>
          <a href={`/api/qr/${link.alias}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4" /> QR
            </Button>
          </a>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-2xl font-bold font-mono">{shortUrl}</h1>
          <StatusBadge status={link.status} />
          {link.is_guest && <Badge variant="outline">Guest</Badge>}
          {link.workspace && <Badge variant="info">{link.workspace.name}</Badge>}
          {link.has_password && <Badge variant="secondary">Password Protected</Badge>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailField label="Destination URL" value={link.destination_url} mono />
          <DetailField label="Alias" value={link.alias} mono />
          <DetailField label="Title" value={link.title || '—'} />
          <DetailField label="Description" value={link.description || '—'} />
          <DetailField label="Creator Name" value={link.creator?.full_name || '—'} />
          <DetailField label="Creator Email" value={link.creator?.email || '—'} />
          <DetailField label="User ID" value={link.creator_id || '—'} mono />
          <DetailField label="Workspace" value={link.workspace?.name || 'None'} />
          <DetailField label="Created" value={formatDateTime(link.created_at)} />
          <DetailField label="Updated" value={formatDateTime(link.updated_at)} />
          <DetailField
            label="Expiry"
            value={link.expires_at ? formatDateTime(link.expires_at) : 'Never'}
          />
          <DetailField
            label="Remaining Time"
            value={link.expires_at ? getRemainingTime(link.expires_at) : 'No expiry'}
          />
        </div>

        {link.utm_source || link.utm_medium || link.utm_campaign ? (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">UTM Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DetailField label="Source" value={link.utm_source || '—'} />
              <DetailField label="Medium" value={link.utm_medium || '—'} />
              <DetailField label="Campaign" value={link.utm_campaign || '—'} />
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={MousePointerClick} label="Total Clicks" value={formatNumber(link.total_clicks || 0)} />
        <StatCard icon={Calendar} label="Today's Clicks" value={formatNumber(link.today_clicks || 0)} />
        <StatCard icon={Activity} label="Promo Clicks" value={formatNumber(link.promo_clicks || 0)} />
        <StatCard icon={Clock} label="Last Click" value={link.last_click_at ? timeAgo(link.last_click_at) : 'Never'} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Click Timeline (30 days)</h3>
        <TimelineChart data={analytics.timeline} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard title="Devices" icon={Monitor} data={analytics.device} />
        <BreakdownCard title="Browsers" icon={Chrome} data={analytics.browser} />
        <BreakdownCard title="Operating Systems" icon={Monitor} data={analytics.os} />
        <BreakdownCard title="Countries" icon={Globe} data={analytics.country} />
        <BreakdownCard title="Cities" icon={MapPin} data={analytics.city} />
        <BreakdownCard title="Referrers" icon={Link2} data={analytics.referer} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Clicks (Last 20)</h3>
        {analytics.recent_clicks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No clicks recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-left py-2 px-2">Country</th>
                  <th className="text-left py-2 px-2">City</th>
                  <th className="text-left py-2 px-2">Browser</th>
                  <th className="text-left py-2 px-2">OS</th>
                  <th className="text-left py-2 px-2">Device</th>
                  <th className="text-left py-2 px-2">Unique</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recent_clicks.map((click: any, i: number) => (
                  <tr key={click.id || i} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="py-2 px-2 text-xs text-muted-foreground">{timeAgo(click.created_at)}</td>
                    <td className="py-2 px-2">{click.country || '—'}</td>
                    <td className="py-2 px-2">{click.city || '—'}</td>
                    <td className="py-2 px-2">{click.browser || '—'}</td>
                    <td className="py-2 px-2">{click.os || '—'}</td>
                    <td className="py-2 px-2">{click.device || '—'}</td>
                    <td className="py-2 px-2">{click.is_unique ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: any; label: string; dot: string }> = {
    active: { variant: 'success', label: 'Active', dot: 'bg-success' },
    expiring: { variant: 'warning', label: 'Expiring Soon', dot: 'bg-warning' },
    expired: { variant: 'error', label: 'Expired', dot: 'bg-error' },
    disabled: { variant: 'secondary', label: 'Disabled', dot: 'bg-muted-foreground' },
  };
  const c = config[status] || config.active;
  return (
    <Badge variant={c.variant}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </Badge>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </Card>
  );
}

function BreakdownCard({ title, icon: Icon, data }: { title: string; icon: any; data: { name: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No data</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 8).map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-sm font-medium min-w-0 flex-1 truncate">{item.name}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">{formatNumber(item.count)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TimelineChart({ data }: { data: { date: string; clicks: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No clicks in the last 30 days</p>;
  }

  const max = Math.max(...data.map((d) => d.clicks), 1);
  const width = 100;
  const height = 120;
  const step = width / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => `${i * step},${height - (d.clicks / max) * height}`);
  const path = `M ${points.join(' L ')}`;
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
        <path d={areaPath} fill="hsl(var(--primary))" opacity={0.15} />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{data[0]?.date ? formatDateTime(data[0].date).split(' ')[0] : ''}</span>
        <span>{data[data.length - 1]?.date ? formatDateTime(data[data.length - 1].date).split(' ')[0] : ''}</span>
      </div>
    </div>
  );
}

function getRemainingTime(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms < 0) return 'Expired';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
