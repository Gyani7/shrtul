'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AbuseFlagWithRelations {
  id: string;
  reason: string;
  severity: string;
  resolved: boolean;
  created_at: string;
  links: { alias: string; original_url: string } | null;
  profiles: { email: string } | null;
}

export function AdminReports() {
  const [flags, setFlags] = useState<AbuseFlagWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/abuse')
      .then(res => res.json())
      .then(data => setFlags(data.flags || []))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    const res = await fetch('/api/admin/abuse', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resolved: true }),
    });
    if (res.ok) {
      setFlags(flags.map(f => f.id === id ? { ...f, resolved: true } : f));
    }
  };

  const severityVariant = (severity: string) => {
    if (severity === 'high') return 'error' as const;
    if (severity === 'medium') return 'warning' as const;
    return 'info' as const;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports &amp; Abuse</h1>
        <p className="text-sm text-muted-foreground">Flagged content and abuse reports</p>
      </div>

      <Card>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : flags.length === 0 ? (
          <div className="text-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No reports yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flags.map((flag) => (
              <div key={flag.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={severityVariant(flag.severity)}>{flag.severity}</Badge>
                    {flag.resolved && <Badge variant="success">Resolved</Badge>}
                    {flag.links && <span className="text-xs text-muted-foreground">Link: /{flag.links.alias}</span>}
                  </div>
                  <p className="text-sm">{flag.reason}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {flag.profiles && <span>By: {flag.profiles.email}</span>}
                    <span>{formatDate(flag.created_at)}</span>
                  </div>
                </div>
                {!flag.resolved && (
                  <Button size="sm" variant="outline" onClick={() => handleResolve(flag.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
