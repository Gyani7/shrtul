'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Puzzle, Power, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase-browser';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  plugin_key: string;
  name: string;
  version: string;
  is_enabled: boolean;
  installed_at: string;
}

interface PluginManifest {
  key: string;
  name: string;
  version: string;
  description: string;
  category: string;
}

export function PluginsPage() {
  const router = useRouter();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [available, setAvailable] = useState<PluginManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/dashboard/plugins');
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
      const res = await fetch(`/api/plugins?workspace_id=${ws}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlugins(data.plugins || []);
      }
    }

    const manifestRes = await fetch(`/api/plugins`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (manifestRes.ok) {
      const data = await manifestRes.json();
      setAvailable(data.plugins || []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function installPlugin(manifest: PluginManifest) {
    if (!workspaceId) return;
    setInstalling(manifest.key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ workspace_id: workspaceId, plugin_key: manifest.key, name: manifest.name }),
      });
      if (res.ok) {
        toast.success(`${manifest.name} installed`);
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Install failed');
      }
    } catch {
      toast.error('Install failed');
    }
    setInstalling(null);
  }

  async function togglePlugin(plugin: Plugin) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/plugins', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: plugin.id, is_enabled: !plugin.is_enabled }),
    });
    if (res.ok) {
      setPlugins((prev) =>
        prev.map((p) => (p.id === plugin.id ? { ...p, is_enabled: !p.is_enabled } : p))
      );
    }
  }

  async function uninstallPlugin(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/plugins?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) {
      setPlugins((prev) => prev.filter((p) => p.id !== id));
      toast.success('Plugin uninstalled');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const installedKeys = new Set(plugins.map((p) => p.plugin_key));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Plugins</h1>
        <p className="text-muted-foreground mt-1">Extend your workspace with plugins.</p>
      </div>

      {plugins.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Installed</h2>
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <Card key={plugin.id} className="border-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Puzzle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{plugin.name}</p>
                        <Badge variant="outline" className="text-xs">v{plugin.version}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{plugin.plugin_key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={plugin.is_enabled} onCheckedChange={() => togglePlugin(plugin)} />
                    <Button variant="ghost" size="icon" onClick={() => uninstallPlugin(plugin.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Available</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {available
            .filter((m) => !installedKeys.has(m.key))
            .map((manifest) => (
              <Card key={manifest.key} className="border-border/60 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Puzzle className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{manifest.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">{manifest.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1">{manifest.description}</p>
                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => installPlugin(manifest)}
                    disabled={installing === manifest.key}
                  >
                    {installing === manifest.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-2" /> Install
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
