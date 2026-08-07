'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Download, Check, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-browser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MarketplaceTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  default_config: Record<string, unknown>;
  price_cents: number;
  is_free: boolean;
  install_count: number;
  rating: number;
  is_purchased: boolean;
}

const CATEGORIES = ['all', 'engagement', 'fun', 'conversion', 'informational'];

export function MarketplacePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/dashboard/marketplace');
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

    const res = await fetch(`/api/marketplace?workspace_id=${ws || ''}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates || []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function installTemplate(template: MarketplaceTemplate) {
    if (!workspaceId) return;
    setInstalling(template.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ workspace_id: workspaceId, template_id: template.id }),
      });
      if (res.ok) {
        toast.success(`${template.name} installed!`);
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, is_purchased: true } : t))
        );
      } else {
        const err = await res.json();
        toast.error(err.error || 'Install failed');
      }
    } catch {
      toast.error('Install failed');
    }
    setInstalling(null);
  }

  const filtered = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || t.category === category;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Experience Marketplace</h1>
        <p className="text-muted-foreground mt-1">Browse and install experience templates for your links.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Card key={template.id} className="border-border/60 transition-all hover:shadow-lg flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  {template.is_free ? (
                    <Badge variant="secondary">Free</Badge>
                  ) : (
                    <Badge variant="default">${(template.price_cents / 100).toFixed(2)}</Badge>
                  )}
                  <Badge variant="outline" className="capitalize">{template.category}</Badge>
                </div>
              </div>
              <CardTitle className="text-base mt-3">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground flex-1">{template.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {template.install_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {template.rating > 0 ? template.rating.toFixed(1) : 'New'}
                  </span>
                </div>
                {template.is_purchased ? (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="h-3 w-3 mr-1" /> Installed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => installTemplate(template)}
                    disabled={installing === template.id}
                  >
                    {installing === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Install'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Filter className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No templates match your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
