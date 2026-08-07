'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  Clock,
  XCircle,
  CheckCircle2,
  X,
  ChevronRight,
} from 'lucide-react';
import { formatNumber, timeAgo } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: 'expiring' | 'expired' | 'error' | 'info';
  title: string;
  message: string;
  link_id?: string;
  alias?: string;
  created_at?: string;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        const notifs: NotificationItem[] = [];

        if (data.expiring_links > 0) {
          notifs.push({
            id: 'expiring',
            type: 'expiring',
            title: 'Links Expiring Soon',
            message: `${data.expiring_links} link${data.expiring_links !== 1 ? 's' : ''} will expire within 24 hours.`,
          });
        }

        if (data.expired_links > 0) {
          notifs.push({
            id: 'expired',
            type: 'expired',
            title: 'Expired Links',
            message: `${data.expired_links} link${data.expired_links !== 1 ? 's' : ''} have expired and are no longer redirecting.`,
          });
        }

        if (data.disabled_links > 0) {
          notifs.push({
            id: 'disabled',
            type: 'info',
            title: 'Disabled Links',
            message: `${data.disabled_links} link${data.disabled_links !== 1 ? 's' : ''} are currently disabled.`,
          });
        }

        setNotifications(notifs);
      })
      .finally(() => setLoading(false));
  }, []);

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visible = notifications.filter((n) => !dismissed.has(n.id));

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (visible.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        <p className="text-sm text-success">All systems operational. No warnings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((notif) => (
        <NotificationBanner key={notif.id} notif={notif} onDismiss={() => dismiss(notif.id)} />
      ))}
    </div>
  );
}

function NotificationBanner({ notif, onDismiss }: { notif: NotificationItem; onDismiss: () => void }) {
  const config = {
    expiring: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    expired: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', border: 'border-error/30' },
    error: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10', border: 'border-error/30' },
    info: { icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  };
  const c = config[notif.type];
  const Icon = c.icon;

  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3 animate-fade-in`}>
      <Icon className={`h-5 w-5 ${c.color} shrink-0`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${c.color}`}>{notif.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
