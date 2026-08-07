import { supabaseServer } from '@/lib/supabase-server';
import { PLANS, type PlanId, type WorkspaceQuota } from './types';

export async function getWorkspaceQuota(workspaceId: string): Promise<WorkspaceQuota | null> {
  const { data, error } = await supabaseServer()
    .from('workspace_quotas')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as WorkspaceQuota | null;
}

export async function getOrCreateQuota(workspaceId: string): Promise<WorkspaceQuota> {
  let quota = await getWorkspaceQuota(workspaceId);
  if (quota) return quota;

  const { data, error } = await supabaseServer()
    .from('workspace_quotas')
    .insert({ workspace_id: workspaceId })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as WorkspaceQuota;
}

export async function incrementQuota(
  workspaceId: string,
  field: 'links_created' | 'clicks_recorded' | 'api_calls' | 'custom_domains',
  amount = 1
): Promise<void> {
  const quota = await getOrCreateQuota(workspaceId);
  const newValue = (quota[field] || 0) + amount;
  await supabaseServer()
    .from('workspace_quotas')
    .update({ [field]: newValue, updated_at: new Date().toISOString() })
    .eq('id', quota.id);
}

export async function checkQuota(
  workspaceId: string,
  field: 'links_created' | 'clicks_recorded' | 'api_calls' | 'custom_domains',
  planId: PlanId
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const quota = await getOrCreateQuota(workspaceId);
  const plan = PLANS[planId];
  const limitKey = field === 'custom_domains' ? 'custom_domains' : `${field}_per_month`;
  const limit = (plan.limits as Record<string, number>)[limitKey] ?? 0;
  const current = quota[field] || 0;
  return { allowed: current < limit, current, limit };
}

export async function resetMonthlyQuotas(): Promise<void> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  await supabaseServer()
    .from('workspace_quotas')
    .update({
      links_created: 0,
      clicks_recorded: 0,
      api_calls: 0,
      period_start: monthStart.toISOString().split('T')[0],
      period_end: monthEnd.toISOString().split('T')[0],
      updated_at: now.toISOString(),
    })
    .lt('period_end', monthStart.toISOString().split('T')[0]);
}
