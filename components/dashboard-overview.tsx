'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, MousePointerClick, TrendingUp, Clock, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import { formatNumber, timeAgo, truncate, cn } from '@/lib/utils';
import { useState } from 'react';
import type { Link as LinkType } from '@/lib/types';

export function DashboardOverview({ links, totalLinks, totalClicks }: { links: LinkType[]; totalLinks: number; totalClicks: number }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (alias: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${alias}`);
    setCopied(alias);
    setTimeout(() => setCopied(null), 2000);
  };

  const stats = [
    { label: 'Total Links', value: formatNumber(totalLinks), icon: Link2, color: 'text-primary' },
    { label: 'Total Clicks', value: formatNumber(totalClicks), icon: MousePointerClick, color: 'text-success' },
    { label: 'Active Links', value: formatNumber(links.filter(l => l.is_active).length), icon: TrendingUp, color: 'text-accent' },
    { label: 'Guest Links', value: formatNumber(links.filter(l => l.is_guest).length), icon: Clock, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">Your link performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Links</CardTitle>
          <CardDescription>Your most recently created short links</CardDescription>
        </CardHeader>
        <div className="space-y-2">
          {links.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No links yet. Create your first short link!</p>
              <Link href="/" className="inline-flex h-10 px-4 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
                Create a link
              </Link>
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">/{link.alias}</span>
                    {link.is_guest && <Badge variant="warning">Guest</Badge>}
                    {!link.is_active && <Badge variant="error">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{truncate(link.original_url, 60)}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{formatNumber(link.total_clicks)} clicks</span>
                    <span>{timeAgo(link.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleCopy(link.alias)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Copy">
                    {copied === link.alias ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a href={`/api/qr/${link.alias}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="QR">
                    <QrCode className="h-4 w-4" />
                  </a>
                  <a href={`/${link.alias}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Open">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
