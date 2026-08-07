'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Bell, Check, Trash2, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-browser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Preferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  click_alerts: boolean;
  quota_alerts: boolean;
  security_alerts: boolean;
  product_updates: boolean;
}

const PREF_LABELS: Record<keyof Preferences, string> = {
  email_enabled: 'Email notifications',
  push_enabled: 'Push notifications',
  in_app_enabled: 'In-app notifications',
  click_alerts: 'Click milestone alerts',
  quota_alerts: 'Quota warning alerts',
  security_alerts: 'Security alerts',
  product_updates: 'Product updates',
};

export function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/dashboard/notifications');
      return;
    }

    const [notifRes, countRes, prefsRes] = await Promise.all([
      fetch('/api/notifications', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      fetch('/api/notifications?action=unread_count', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      fetch('/api/notifications?action=preferences', { headers: { Authorization: `Bearer ${session.access_token}` } }),
    ]);

    if (notifRes.ok) {
      const data = await notifRes.json();
      setNotifications(data.notifications || []);
    }
    if (countRes.ok) {
      const data = await countRes.json();
      setUnreadCount(data.count || 0);
    }
    if (prefsRes.ok) {
      const data = await prefsRes.json();
      setPrefs(data.preferences);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function markAllRead() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ action: 'mark_all_read' }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    }
  }

  async function deleteNotification(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/notifications?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  async function togglePref(key: keyof Preferences, value: boolean) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ action: 'update_preferences', preferences: { [key]: value } }),
    });
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
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={cn(
                'border-border/60 transition-all',
                !notif.is_read && 'border-primary/30 bg-primary/5'
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', notif.is_read ? 'bg-muted' : 'bg-primary/10 text-primary')}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    {!notif.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNotification(notif.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prefs &&
            (Object.keys(PREF_LABELS) as (keyof Preferences)[]).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                  {PREF_LABELS[key]}
                </Label>
                <Switch id={key} checked={prefs[key]} onCheckedChange={(v) => togglePref(key, v)} />
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
