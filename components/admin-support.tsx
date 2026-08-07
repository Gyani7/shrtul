'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { SupportTicket } from '@/lib/types';

export function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetch('/api/admin/support')
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, []);

  const handleReply = async (id: string) => {
    if (!reply.trim()) return;
    const res = await fetch('/api/admin/support', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, admin_reply: reply }),
    });
    if (res.ok) {
      setTickets(tickets.map(t => t.id === id ? { ...t, admin_reply: reply, status: 'resolved', replied_at: new Date().toISOString() } : t));
      setReplying(null);
      setReply('');
    }
  };

  const statusVariant = (status: string) => {
    if (status === 'resolved') return 'success' as const;
    if (status === 'open') return 'warning' as const;
    return 'info' as const;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Messages</h1>
        <p className="text-sm text-muted-foreground">Contact form submissions and support tickets</p>
      </div>

      <Card>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No support messages</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 rounded-lg border border-border/50 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ticket.subject}</span>
                    <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                    <Badge variant="info">{ticket.priority}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(ticket.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>

                {ticket.admin_reply && (
                  <div className="mt-2 p-3 rounded-lg bg-success/10 border border-success/30">
                    <p className="text-xs font-medium text-success mb-1">Admin reply:</p>
                    <p className="text-sm whitespace-pre-wrap">{ticket.admin_reply}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ticket.replied_at && formatDateTime(ticket.replied_at)}</p>
                  </div>
                )}

                {!ticket.admin_reply && replying !== ticket.id && (
                  <Button size="sm" variant="outline" onClick={() => setReplying(ticket.id)}>
                    <MessageSquare className="h-3.5 w-3.5" /> Reply
                  </Button>
                )}

                {replying === ticket.id && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReply(ticket.id)} disabled={!reply.trim()}>
                        <Send className="h-3.5 w-3.5" /> Send Reply
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setReplying(null); setReply(''); }}>Cancel</Button>
                    </div>
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
