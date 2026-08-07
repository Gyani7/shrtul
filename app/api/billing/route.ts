import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase-server';
import { getWorkspaceSubscription, getOrCreateSubscription, updatePlan, cancelSubscription } from '@/engines/monetization/billing';
import { getOrCreateQuota, checkQuota } from '@/engines/monetization/quota';
import { PLANS } from '@/engines/monetization/types';
import type { PlanId } from '@/engines/monetization/types';

export async function GET(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get('workspace_id');
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });

  try {
    const [subscription, quota] = await Promise.all([
      getOrCreateSubscription(workspaceId),
      getOrCreateQuota(workspaceId),
    ]);

    const plan = PLANS[subscription.plan as PlanId] || PLANS.free;
    const usage = {
      links: { current: quota.links_created, limit: plan.limits.links_per_month },
      clicks: { current: quota.clicks_recorded, limit: plan.limits.clicks_per_month },
      api_calls: { current: quota.api_calls, limit: plan.limits.api_calls_per_month },
      custom_domains: { current: quota.custom_domains, limit: plan.limits.custom_domains },
    };

    return NextResponse.json({ subscription, quota, plan, usage });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { workspace_id, plan } = body;

    if (!workspace_id || !plan) {
      return NextResponse.json({ error: 'workspace_id and plan required' }, { status: 400 });
    }

    if (!PLANS[plan as PlanId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const subscription = await updatePlan(workspace_id, plan as PlanId);
    return NextResponse.json({ subscription });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get('workspace_id');
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });

  try {
    const subscription = await cancelSubscription(workspaceId);
    return NextResponse.json({ subscription });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
