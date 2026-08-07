import { supabaseServer } from '@/lib/supabase-server';
import type { Webhook, WebhookDelivery, CreateWebhookInput } from './types';

export async function getWorkspaceWebhooks(workspaceId: string): Promise<Webhook[]> {
  const { data, error } = await supabaseServer()
    .from('webhooks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Webhook[]) || [];
}

export async function createWebhook(input: CreateWebhookInput): Promise<Webhook> {
  const { data, error } = await supabaseServer()
    .from('webhooks')
    .insert({
      workspace_id: input.workspace_id,
      url: input.url,
      events: input.events,
      secret: input.secret || crypto.randomUUID(),
      is_active: input.is_active ?? true,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Webhook;
}

export async function updateWebhook(
  id: string,
  updates: Partial<Pick<Webhook, 'url' | 'events' | 'is_active' | 'secret'>>
): Promise<Webhook> {
  const { data, error } = await supabaseServer()
    .from('webhooks')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Webhook;
}

export async function deleteWebhook(id: string): Promise<void> {
  const { error } = await supabaseServer()
    .from('webhooks')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getWebhookDeliveries(
  webhookId: string,
  limit = 50
): Promise<WebhookDelivery[]> {
  const { data, error } = await supabaseServer()
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as WebhookDelivery[]) || [];
}

export async function dispatchWebhooks(
  workspaceId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const { data: webhooks, error } = await supabaseServer()
    .from('webhooks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
    .contains('events', [event]);

  if (error || !webhooks || webhooks.length === 0) return;

  for (const webhook of webhooks as Webhook[]) {
    const deliveryRecord = await supabaseServer()
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhook.id,
        event,
        payload,
      })
      .select('*')
      .single();

    if (deliveryRecord.error) continue;

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': webhook.secret,
        },
        body: JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(10000),
      });

      await supabaseServer()
        .from('webhook_deliveries')
        .update({
          response_status: response.status,
          delivered: response.ok,
          attempts: 1,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', (deliveryRecord.data as WebhookDelivery).id);
    } catch {
      await supabaseServer()
        .from('webhook_deliveries')
        .update({
          delivered: false,
          attempts: 1,
        })
        .eq('id', (deliveryRecord.data as WebhookDelivery).id);
    }
  }
}
