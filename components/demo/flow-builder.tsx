'use client';

import { useState } from 'react';
import { Workflow, Plus, Trash2, Zap, ArrowRight, Globe, Smartphone, Calendar, User, Clock, GitBranch, Webhook, Bell, Mail, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  label: string;
  icon: typeof Zap;
  config: Record<string, string>;
}

const TRIGGERS = [
  { type: 'trigger', label: 'Link Clicked', icon: Zap, config: { event: 'click' } },
  { type: 'trigger', label: 'Instagram Click', icon: Globe, config: { source: 'instagram' } },
  { type: 'trigger', label: 'Returning Visitor', icon: User, config: { visitor: 'returning' } },
  { type: 'trigger', label: 'Weekend', icon: Calendar, config: { schedule: 'weekend' } },
];

const CONDITIONS = [
  { type: 'condition', label: 'Country = India', icon: Globe, config: { country: 'IN' } },
  { type: 'condition', label: 'Device = Mobile', icon: Smartphone, config: { device: 'mobile' } },
  { type: 'condition', label: 'Time of Day', icon: Clock, config: { time: 'evening' } },
  { type: 'condition', label: 'Returning Visitor', icon: User, config: { visitor: 'returning' } },
];

const ACTIONS = [
  { type: 'action', label: 'Gaming Experience', icon: Sparkles, config: { experience: 'gaming' } },
  { type: 'action', label: 'Hindi Theme', icon: Globe, config: { theme: 'hindi' } },
  { type: 'action', label: 'Festival Theme', icon: Calendar, config: { theme: 'festival' } },
  { type: 'action', label: 'Loyalty Experience', icon: User, config: { experience: 'loyalty' } },
  { type: 'action', label: 'Send Webhook', icon: Webhook, config: { webhook: 'send' } },
  { type: 'action', label: 'Send Notification', icon: Bell, config: { notification: 'send' } },
  { type: 'action', label: 'Send Email', icon: Mail, config: { email: 'send' } },
];

const ALL_NODES = [...TRIGGERS, ...CONDITIONS, ...ACTIONS];

export function FlowBuilder() {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: '1', type: 'trigger', label: 'Link Clicked', icon: Zap, config: { event: 'click' } },
    { id: '2', type: 'condition', label: 'Country = India', icon: Globe, config: { country: 'IN' } },
    { id: '3', type: 'action', label: 'Festival Theme', icon: Calendar, config: { theme: 'festival' } },
  ]);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(-1);

  const addNode = (node: typeof ALL_NODES[number]) => {
    setNodes((prev) => [...prev, { ...node, id: Date.now().toString() } as unknown as FlowNode]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const simulate = () => {
    setSimulating(true);
    setSimStep(-1);
    nodes.forEach((_, i) => {
      setTimeout(() => setSimStep(i), (i + 1) * 800);
    });
    setTimeout(() => { setSimulating(false); setSimStep(-1); }, (nodes.length + 1) * 800);
  };

  const nodeColor = (type: string) => {
    if (type === 'trigger') return 'border-primary bg-primary/5 text-primary';
    if (type === 'condition') return 'border-warning bg-warning/5 text-warning';
    return 'border-success bg-success/5 text-success';
  };

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border p-4 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Visual Workflow Builder</h3>
        </div>
        <button
          onClick={simulate}
          disabled={simulating || nodes.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {simulating ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {simulating ? 'Running...' : 'Run Workflow'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] min-h-[500px]">
        {/* Node Library */}
        <div className="border-r border-border p-4 bg-muted/20">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Triggers</h4>
          <div className="space-y-1.5 mb-4">
            {TRIGGERS.map((n) => (
              <button key={n.label} onClick={() => addNode(n)} className="flex items-center gap-2 w-full rounded-lg border border-border bg-card p-2 text-xs font-medium hover:border-primary transition-all">
                <n.icon className="h-3.5 w-3.5 text-primary" /> {n.label}
              </button>
            ))}
          </div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Conditions</h4>
          <div className="space-y-1.5 mb-4">
            {CONDITIONS.map((n) => (
              <button key={n.label} onClick={() => addNode(n)} className="flex items-center gap-2 w-full rounded-lg border border-border bg-card p-2 text-xs font-medium hover:border-warning transition-all">
                <n.icon className="h-3.5 w-3.5 text-warning" /> {n.label}
              </button>
            ))}
          </div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Actions</h4>
          <div className="space-y-1.5">
            {ACTIONS.map((n) => (
              <button key={n.label} onClick={() => addNode(n)} className="flex items-center gap-2 w-full rounded-lg border border-border bg-card p-2 text-xs font-medium hover:border-success transition-all">
                <n.icon className="h-3.5 w-3.5 text-success" /> {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-1">
            {nodes.map((node, i) => (
              <div key={node.id}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 p-4 transition-all animate-slide-up',
                    nodeColor(node.type),
                    simStep === i && 'scale-105 shadow-lg ring-2 ring-primary'
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                    <node.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase opacity-60">{node.type}</span>
                      {simStep === i && <span className="text-xs animate-pulse">● Running</span>}
                    </div>
                    <p className="text-sm font-medium">{node.label}</p>
                  </div>
                  <button onClick={() => removeNode(node.id)} className="p-1 text-muted-foreground hover:text-error">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {i < nodes.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className={cn('flex items-center gap-1 text-xs', simStep === i ? 'text-primary' : 'text-muted-foreground')}>
                      <div className={cn('h-8 w-0.5', simStep === i ? 'bg-primary' : 'bg-border')} />
                      <ArrowRight className={cn('h-3 w-3', simStep === i ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {nodes.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Add triggers, conditions, and actions to build your workflow</p>
              </div>
            )}
          </div>

          {simStep === nodes.length - 1 && simulating && (
            <div className="mt-4 rounded-xl bg-success/10 border border-success/30 p-3 text-center animate-fade-in">
              <p className="text-sm text-success font-medium">Workflow complete! Action executed successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
