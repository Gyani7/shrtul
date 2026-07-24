'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Copy, Check, QrCode, ExternalLink, Trash2, Search, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { formatNumber, timeAgo, truncate, cn } from '@/lib/utils';
import type { Link } from '@/lib/types';

export function LinksManager({ initialLinks }: { initialLinks: Link[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [analyticsFor, setAnalyticsFor] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<null | { stats: { countries: Record<string, number>; browsers: Record<string, number>; devices: Record<string, number>; total: number } }>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const filtered = links.filter(l =>
    l.alias.toLowerCase().includes(search.toLowerCase()) ||
    l.original_url.toLowerCase().includes(search.toLowerCase()) ||
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (alias: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${alias}`);
    setCopied(alias);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (alias: string) => {
    if (!confirm('Delete this link permanently?')) return;
    const res = await fetch(`/api/links/${alias}`, { method: 'DELETE' });
    if (res.ok) {
      setLinks(links.filter(l => l.alias !== alias));
    }
  };

  const handleToggleActive = async (link: Link) => {
    const res = await fetch(`/api/links/${link.alias}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !link.is_active }),
    });
    if (res.ok) {
      setLinks(links.map(l => l.alias === link.alias ? { ...l, is_active: !l.is_active } : l));
    }
  };

  const handleAnalytics = async (alias: string) => {
    if (analyticsFor === alias) {
      setAnalyticsFor(null);
      return;
    }
    setLoadingAnalytics(true);
    setAnalyticsFor(alias);
    const res = await fetch(`/api/links/${alias}/clicks`);
    const data = await res.json();
    setAnalyticsData(data);
    setLoadingAnalytics(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Links</h1>
        <p className="text-sm text-muted-foreground">Manage and track your short links</p>
      </div>

      <Input
        placeholder="Search links..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{search ? 'No links match your search' : 'No links yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((link) => (
              <div key={link.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium">/{link.alias}</span>
                      {link.is_guest && <Badge variant="warning">Guest</Badge>}
                      {!link.is_active && <Badge variant="error">Inactive</Badge>}
                      {link.password_hash && <Badge variant="info">Protected</Badge>}
                      {link.expires_at && new Date(link.expires_at) < new Date() && <Badge variant="error">Expired</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{truncate(link.original_url, 60)}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatNumber(link.total_clicks)} clicks</span>
                      <span>{timeAgo(link.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleCopy(link.alias)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Copy">
                      {copied === link.alias ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleAnalytics(link.alias)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Analytics">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <a href={`/api/qr/${link.alias}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="QR">
                      <QrCode className="h-4 w-4" />
                    </a>
                    <a href={`/${link.alias}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Open">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button onClick={() => handleToggleActive(link)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title={link.is_active ? 'Deactivate' : 'Activate'}>
                      {link.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(link.alias)} className="p-2 rounded-lg hover:bg-error/15 text-muted-foreground hover:text-error" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {analyticsFor === link.alias && (
                  <div className="ml-4 mr-4 mb-2 p-4 rounded-lg bg-muted/30 border border-border/30 animate-slide-up">
                    {loadingAnalytics ? (
                      <p className="text-sm text-muted-foreground">Loading analytics...</p>
                    ) : analyticsData ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <StatBox label="Total Clicks" value={analyticsData.stats.total} />
                          <StatBox label="Countries" value={Object.keys(analyticsData.stats.countries).length} />
                          <StatBox label="Browsers" value={Object.keys(analyticsData.stats.browsers).length} />
                          <StatBox label="Devices" value={Object.keys(analyticsData.stats.devices).length} />
                        </div>
                        <BreakdownTable title="Top Countries" data={analyticsData.stats.countries} />
                        <BreakdownTable title="Browsers" data={analyticsData.stats.browsers} />
                        <BreakdownTable title="Devices" data={analyticsData.stats.devices} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No analytics data</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-card p-3 border border-border/30">
      <div className="text-xl font-bold">{formatNumber(value)}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function BreakdownTable({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (entries.length === 0) return null;
  const max = entries[0][1];
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-24 truncate text-muted-foreground">{key}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(val / max) * 100}%` }} />
            </div>
            <span className="w-10 text-right text-muted-foreground">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
