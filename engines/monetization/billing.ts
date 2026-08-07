import { supabaseServer } from '@/lib/supabase-server';
import type { Subscription, PlanId } from './types';

export async function getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
  const { data, error } = await supabaseServer()
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Subscription | null;
}

export async function getOrCreateSubscription(workspaceId: string): Promise<Subscription> {
  let sub = await getWorkspaceSubscription(workspaceId);
  if (sub) return sub;

  const { data, error } = await supabaseServer()
    .from('subscriptions')
    .insert({ workspace_id: workspaceId, plan: 'free', status: 'active' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Subscription;
}

export async function updatePlan(workspaceId: string, plan: PlanId): Promise<Subscription> {
  const sub = await getOrCreateSubscription(workspaceId);
  const { data, error } = await supabaseServer()
    .from('subscriptions')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', sub.id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Subscription;
}

export async function cancelSubscription(workspaceId: string): Promise<Subscription> {
  return updatePlan(workspaceId, 'free');
}
