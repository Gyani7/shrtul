'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Zap, Crown, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase-browser';
import { PLANS, type PlanId } from '@/engines/monetization/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLAN_ICONS: Record<PlanId, typeof Zap> = {
  free: Zap,
  starter: Check,
  pro: Crown,
  enterprise: Building2,
};

export function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [usage, setUsage] = useState<Record<string, { current: number; limit: number }>>({});
  const [changing, setChanging] = useState<PlanId | null>(null);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/dashboard/billing');
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
      const res = await fetch(`/api/billing?workspace_id=${ws}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(data.subscription.plan as PlanId);
        setUsage(data.usage || {});
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function changePlan(plan: PlanId) {
    if (!workspaceId) return;
    setChanging(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ workspace_id: workspaceId, plan }),
      });
      if (res.ok) {
        toast.success(`Plan changed to ${PLANS[plan].name}`);
        setCurrentPlan(plan);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to change plan');
      }
    } catch {
      toast.error('Failed to change plan');
    }
    setChanging(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const planIds = Object.keys(PLANS) as PlanId[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and monitor usage.</p>
      </div>

      {Object.keys(usage).length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Current Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(usage).map(([key, val]) => {
              const pct = val.limit > 0 ? Math.min((val.current / val.limit) * 100, 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">
                      {val.current.toLocaleString()} / {val.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={pct} className={cn(pct > 80 && '[&>div]:bg-warning')} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planIds.map((planId) => {
          const plan = PLANS[planId];
          const Icon = PLAN_ICONS[planId];
          const isCurrent = currentPlan === planId;

          return (
            <Card
              key={planId}
              className={cn(
                'border-border/60 flex flex-col transition-all',
                isCurrent && 'border-primary shadow-lg ring-1 ring-primary/20'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardTitle className="text-lg mt-3">{plan.name}</CardTitle>
                <p className="text-2xl font-bold">
                  ${plan.price_monthly}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 text-sm flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full"
                  variant={isCurrent ? 'outline' : 'primary'}
                  disabled={isCurrent || changing === planId}
                  onClick={() => changePlan(planId)}
                >
                  {changing === planId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Switch to {plan.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
