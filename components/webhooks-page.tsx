'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Webhook, Check, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase-browser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  event: string;
  response_status: number | null;
  delivered: boolean;
  attempts: number;
  created_at: string;
}

const AVAILABLE_EVENTS = [
  'click.created',
  'link.created',
  'link.updated',
  'link.deleted',
  'link.expired',
  'quota.warning',
];

export function WebhooksPage() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/dashboard/webhooks');
      return;
    }

    const { data: wsData } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', session.user.id)
      .limit(1);

    let ws = wsData?.[0]?.id;
    if (!ws) {
      const { data: memberWs } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', session.user.id)
        .limit(1);
      ws = memberWs?.[0]?.workspace_id;
    }
    setWorkspaceId(ws || null);

    if (ws) {
      const res = await fetch(`/api/webhooks?workspace_id=${ws}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function viewDeliveries(webhook: Webhook) {
    setSelectedWebhook(webhook);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/webhooks?workspace_id=${workspaceId}&webhook_id=${webhook.id}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    }
  }

  async function deleteWebhook(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/webhooks?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) {
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success('Webhook deleted');
    }
  }

  async function toggleActive(webhook: Webhook) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/webhooks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: webhook.id, is_active: !webhook.is_active }),
    });
    if (res.ok) {
      setWebhooks((prev) =>
        prev.map((w) => (w.id === webhook.id ? { ...w, is_active: !w.is_active } : w))
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-1">Send real-time events to external services.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Webhook className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No webhooks configured yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-sm truncate">{webhook.url}</p>
                      <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                        {webhook.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs font-mono">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => viewDeliveries(webhook)}>
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Switch checked={webhook.is_active} onCheckedChange={() => toggleActive(webhook)} />
                    <Button variant="ghost" size="icon" onClick={() => deleteWebhook(webhook.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateWebhookDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        workspaceId={workspaceId}
        onCreated={loadData}
      />

      {selectedWebhook && (
        <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Log</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {deliveries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No deliveries yet.</p>
              ) : (
                deliveries.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {d.delivered ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-mono">{d.event}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {d.response_status && <Badge variant="outline">{d.response_status}</Badge>}
                      <span>{new Date(d.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateWebhookDialog({
  open,
  onOpenChange,
  workspaceId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string | null;
  onCreated: () => void;
}) {
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!workspaceId || !url || selectedEvents.length === 0) return;
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ workspace_id: workspaceId, url, events: selectedEvents }),
      });
      if (res.ok) {
        toast.success('Webhook created');
        onOpenChange(false);
        setUrl('');
        setSelectedEvents([]);
        onCreated();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed');
      }
    } catch {
      toast.error('Failed');
    }
    setCreating(false);
  }

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Endpoint URL</Label>
            <Input
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Events to subscribe</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EVENTS.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono transition-colors',
                    selectedEvents.includes(event)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={creating || !url || selectedEvents.length === 0}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
