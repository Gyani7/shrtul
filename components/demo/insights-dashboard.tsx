'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Funnel, FunnelChart, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import { Brain, TrendingUp, Eye, MousePointerClick, Clock, Check, X, Target, Zap, Globe, Smartphone, ArrowRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const FUNNEL_DATA = [
  { name: 'Click', value: 1000, fill: '#0ea5e9' },
  { name: 'Attention', value: 780, fill: '#14b8a6' },
  { name: 'Engagement', value: 520, fill: '#f59e0b' },
  { name: 'Completion', value: 410, fill: '#22c55e' },
  { name: 'Conversion', value: 180, fill: '#ec4899' },
];

const RADAR_DATA = [
  { metric: 'Click', value: 95 },
  { metric: 'Attention', value: 78 },
  { metric: 'Engagement', value: 64 },
  { metric: 'Completion', value: 71 },
  { metric: 'Conversion', value: 45 },
  { metric: 'Replay', value: 32 },
];

const AI_INSIGHTS = [
  { icon: Brain, text: 'Your completion rate is 23% above the industry average. Users are engaging well with countdown experiences.', type: 'positive' },
  { icon: TrendingUp, text: 'Mobile users from India show 40% higher engagement. Consider localizing more experiences for Hindi.', type: 'insight' },
  { icon: Target, text: 'CTA experiences convert 2.3x better than countdowns for e-commerce links. Switch your product links to CTA.', type: 'recommendation' },
  { icon: Zap, text: 'Drop-off is highest at the 3-second mark. Try reducing experience duration to 5 seconds for better completion.', type: 'warning' },
];

export function InsightsDashboard() {
  const [timeData, setTimeData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`,
      clicks: Math.floor(Math.random() * 100) + 20,
      attention: Math.floor(Math.random() * 80) + 40,
      completion: Math.floor(Math.random() * 60) + 30,
      conversion: Math.floor(Math.random() * 20) + 5,
    }))
  );
  const [live, setLive] = useState(true);
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setTimeData((prev) => {
        const now = new Date();
        return [...prev.slice(1), {
          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
          clicks: Math.floor(Math.random() * 100) + 20,
          attention: Math.floor(Math.random() * 80) + 40,
          completion: Math.floor(Math.random() * 60) + 30,
          conversion: Math.floor(Math.random() * 20) + 5,
        }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [live]);

  const metrics = [
    { icon: MousePointerClick, label: 'Total Clicks', value: '48.2K', change: '+12%', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Eye, label: 'Attention Time', value: '4.8s', change: '+8%', color: 'text-accent', bg: 'bg-accent/10' },
    { icon: Check, label: 'Completion Rate', value: '72%', change: '+15%', color: 'text-success', bg: 'bg-success/10' },
    { icon: X, label: 'Drop-off Rate', value: '18%', change: '-5%', color: 'text-error', bg: 'bg-error/10' },
    { icon: Clock, label: 'Avg Wait Time', value: '3.2s', change: '-12%', color: 'text-warning', bg: 'bg-warning/10' },
    { icon: Target, label: 'Conversion Rate', value: '18%', change: '+23%', color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Metrics */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Advanced Metrics</h3>
          </div>
          <button onClick={() => setLive(!live)} className={cn('flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium', live ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
            <span className={cn('h-2 w-2 rounded-full', live ? 'bg-success animate-pulse' : 'bg-muted-foreground')} />
            {live ? 'Live' : 'Paused'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-muted/50 p-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg mb-2', m.bg, m.color)}>
                <m.icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold tabular-nums">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className={cn('text-xs font-medium', m.change.startsWith('+') ? 'text-success' : 'text-error')}>{m.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Multi-line chart */}
        <div className="glass-strong rounded-2xl p-6">
          <h4 className="text-sm font-semibold mb-4">Engagement Over Time</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} dot={false} animationDuration={300} />
              <Line type="monotone" dataKey="attention" stroke="#14b8a6" strokeWidth={2} dot={false} animationDuration={300} />
              <Line type="monotone" dataKey="completion" stroke="#22c55e" strokeWidth={2} dot={false} animationDuration={300} />
              <Line type="monotone" dataKey="conversion" stroke="#ec4899" strokeWidth={2} dot={false} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div className="glass-strong rounded-2xl p-6">
          <h4 className="text-sm font-semibold mb-4">Conversion Funnel</h4>
          <ResponsiveContainer width="100%" height={200}>
            <FunnelChart>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Funnel dataKey="value" data={FUNNEL_DATA} isAnimationActive>
                <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" fontSize={11} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={12} fontWeight="bold" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass-strong rounded-2xl p-6">
          <h4 className="text-sm font-semibold mb-4">Engagement Radar</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Radar dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} animationDuration={500} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Area chart */}
        <div className="glass-strong rounded-2xl p-6">
          <h4 className="text-sm font-semibold mb-4">Click Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} fill="url(#distGradient)" animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {AI_INSIGHTS.map((insight, i) => (
            <div
              key={i}
              onClick={() => setActiveInsight(i)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all animate-slide-up',
                activeInsight === i ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                insight.type === 'positive' && 'border-l-4 border-l-success',
                insight.type === 'warning' && 'border-l-4 border-l-warning',
                insight.type === 'recommendation' && 'border-l-4 border-l-primary',
                insight.type === 'insight' && 'border-l-4 border-l-accent'
              )}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                insight.type === 'positive' && 'bg-success/10 text-success',
                insight.type === 'warning' && 'bg-warning/10 text-warning',
                insight.type === 'recommendation' && 'bg-primary/10 text-primary',
                insight.type === 'insight' && 'bg-accent/10 text-accent'
              )}>
                <insight.icon className="h-4 w-4" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
