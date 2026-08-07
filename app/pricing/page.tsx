import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { PLANS, type PlanId } from '@/engines/monetization/types';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing — Simple, Transparent Plans for Every Team',
  description: 'Free forever for individuals. Scale up with Pro and Enterprise plans. No hidden fees, cancel anytime.',
  alternates: { canonical: 'https://shrtul.com/pricing' },
  openGraph: { title: 'Pricing — Shrtul X', description: 'Simple, transparent plans for every team.', url: 'https://shrtul.com/pricing' },
};

const PLAN_ICONS: Record<PlanId, typeof Zap> = {
  free: Zap, starter: Check, pro: Crown, enterprise: Building2,
};

export default function PricingPage() {
  const planIds = Object.keys(PLANS) as PlanId[];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Pricing that scales<br />
            <span className="gradient-text">with your growth</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 text-balance">
            Free forever for individuals. Scale up with advanced features when you need them. No hidden fees.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {planIds.map((planId, i) => {
              const plan = PLANS[planId];
              const Icon = PLAN_ICONS[planId];
              const isPopular = planId === 'pro';

              return (
                <div
                  key={planId}
                  className={cn(
                    'glass-strong rounded-2xl p-6 flex flex-col card-hover animate-slide-up relative',
                    isPopular && 'border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10'
                  )}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-2 mb-1">
                    ${plan.price_monthly}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>

                  <ul className="space-y-2 mt-6 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login?mode=signup"
                    className={cn(
                      'inline-flex h-11 w-full items-center justify-center rounded-xl font-medium transition-all',
                      isPopular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
                        : 'border border-border hover:bg-muted text-foreground'
                    )}
                  >
                    {planId === 'free' ? 'Get Started' : `Choose ${plan.name}`}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
