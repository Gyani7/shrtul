'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Link2, MousePointerClick, Clock, TrendingUp, UserCog } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface Stats {
  total_users: number;
  total_links: number;
  total_clicks: number;
  guest_links: number;
  permanent_links: number;
  active_users_30d: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.total_users, icon: Users, color: 'text-primary' },
    { label: 'Active Users (30d)', value: stats?.active_users_30d, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Links', value: stats?.total_links, icon: Link2, color: 'text-accent' },
    { label: 'Guest Links', value: stats?.guest_links, icon: Clock, color: 'text-warning' },
    { label: 'Permanent Links', value: stats?.permanent_links, icon: Link2, color: 'text-primary' },
    { label: 'Total Clicks', value: stats?.total_clicks, icon: MousePointerClick, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatNumber(card.value || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
