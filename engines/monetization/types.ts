export interface Subscription {
  id: string;
  workspace_id: string;
  plan: PlanId;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceQuota {
  id: string;
  workspace_id: string;
  links_created: number;
  clicks_recorded: number;
  api_calls: number;
  custom_domains: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  price_monthly: number;
  limits: {
    links_per_month: number;
    clicks_per_month: number;
    api_calls_per_month: number;
    custom_domains: number;
    team_members: number;
  };
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    limits: {
      links_per_month: 50,
      clicks_per_month: 1000,
      api_calls_per_month: 100,
      custom_domains: 0,
      team_members: 1,
    },
    features: ['Basic link shortening', 'QR codes', 'Basic analytics', '1 workspace'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price_monthly: 9,
    limits: {
      links_per_month: 500,
      clicks_per_month: 10000,
      api_calls_per_month: 1000,
      custom_domains: 1,
      team_members: 3,
    },
    features: ['Everything in Free', 'Custom domains', 'Password protection', 'Expiry links', 'Experience templates'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price_monthly: 29,
    limits: {
      links_per_month: 10000,
      clicks_per_month: 100000,
      api_calls_per_month: 10000,
      custom_domains: 5,
      team_members: 10,
    },
    features: ['Everything in Starter', 'All experience templates', 'Geo/device redirect', 'API access', 'Webhooks', 'Advanced analytics'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: 99,
    limits: {
      links_per_month: 100000,
      clicks_per_month: 1000000,
      api_calls_per_month: 100000,
      custom_domains: 20,
      team_members: 50,
    },
    features: ['Everything in Pro', 'Unlimited workspaces', 'SSO', 'Audit logs', 'Priority support', 'Custom SLA'],
  },
};
