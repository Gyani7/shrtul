import { supabaseServer } from '@/lib/supabase-server';
import type { Notification, CreateNotificationInput, NotificationPreferences } from './types';

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const { data, error } = await supabaseServer()
    .from('notifications')
    .insert({
      user_id: input.user_id,
      workspace_id: input.workspace_id || null,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data || {},
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Notification;
}

export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const { data, error } = await supabaseServer()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as Notification[]) || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabaseServer()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabaseServer()
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabaseServer()
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabaseServer()
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabaseServer()
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as NotificationPreferences | null;
}

export async function getOrCreatePreferences(userId: string): Promise<NotificationPreferences> {
  let prefs = await getPreferences(userId);
  if (prefs) return prefs;

  const { data, error } = await supabaseServer()
    .from('notification_preferences')
    .insert({ user_id: userId })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as NotificationPreferences;
}

export async function updatePreferences(
  userId: string,
  updates: Partial<Pick<NotificationPreferences, 'email_enabled' | 'push_enabled' | 'in_app_enabled' | 'click_alerts' | 'quota_alerts' | 'security_alerts' | 'product_updates'>>
): Promise<NotificationPreferences> {
  const prefs = await getOrCreatePreferences(userId);
  const { data, error } = await supabaseServer()
    .from('notification_preferences')
    .update(updates)
    .eq('id', prefs.id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as NotificationPreferences;
}

export async function dispatchNotification(input: CreateNotificationInput): Promise<void> {
  const prefs = await getPreferences(input.user_id);
  if (prefs) {
    if (!prefs.in_app_enabled) return;
    if (input.type === 'click.milestone' && !prefs.click_alerts) return;
    if (input.type === 'quota.warning' && !prefs.quota_alerts) return;
    if (input.type === 'security.alert' && !prefs.security_alerts) return;
    if (input.type === 'product.update' && !prefs.product_updates) return;
  }
  await createNotification(input);
}
