'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Plus, Trash2, TrafficCone, Globe, Settings as SettingsIcon, Tag } from 'lucide-react';
import type { PlatformSettings, PromoUrl } from '@/lib/types';

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [promoUrls, setPromoUrls] = useState<PromoUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [newPromo, setNewPromo] = useState({ url: '', name: '', description: '', weight: 1 });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setPromoUrls(data.promoUrls || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPromo = async () => {
    if (!newPromo.url || !newPromo.name) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promoUrls: [{ ...newPromo, _action: 'create' }],
      }),
    });
    if (res.ok) {
      setNewPromo({ url: '', name: '', description: '', weight: 1 });
      const data = await fetch('/api/admin/settings').then(r => r.json());
      setPromoUrls(data.promoUrls || []);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promo URL?')) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoUrls: [{ id, _action: 'delete' }] }),
    });
    if (res.ok) {
      setPromoUrls(promoUrls.filter(p => p.id !== id));
    }
  };

  const handleTogglePromo = async (promo: PromoUrl) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promoUrls: [{ ...promo, is_active: !promo.is_active, _action: 'update' }],
      }),
    });
    if (res.ok) {
      setPromoUrls(promoUrls.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p));
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration</p>
      </div>

      {/* Traffic Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrafficCone className="h-5 w-5 text-warning" /> Traffic Sharing</CardTitle>
          <CardDescription>Configure redirect traffic percentage and promo endpoints</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Enable Traffic Sharing</p>
              <p className="text-xs text-muted-foreground">Send a percentage of traffic through promo endpoints</p>
            </div>
            <Button
              variant={settings?.promo_enabled ? 'success' : 'outline'}
              size="sm"
              onClick={() => setSettings(s => s ? { ...s, promo_enabled: !s.promo_enabled } : s)}
            >
              {settings?.promo_enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <Input
            label="Redirect Percentage (max 100%)"
            type="number"
            min={0}
            max={100}
            value={settings?.redirect_percentage || 0}
            onChange={(e) => setSettings(s => s ? { ...s, redirect_percentage: Number(e.target.value) } : s)}
            hint="Percentage of clicks that go through promo endpoints before reaching destination"
          />

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-xs text-warning">
              Currently {settings?.redirect_percentage || 0}% of shortened-link traffic is routed through configured redirect endpoints before reaching the destination. This is disclosed in the Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </Card>

      {/* Promo URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Promo Endpoints</CardTitle>
          <CardDescription>Redirect endpoints for traffic sharing</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {promoUrls.map((promo) => (
            <div key={promo.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{promo.name}</span>
                  {promo.is_active ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge>}
                  <Badge variant="info">Weight: {promo.weight}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{promo.url}</p>
                <p className="text-xs text-muted-foreground mt-1">{promo.total_sends} sends</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleTogglePromo(promo)}>
                  {promo.is_active ? 'Disable' : 'Enable'}
                </Button>
                <button onClick={() => handleDeletePromo(promo.id)} className="p-2 rounded-lg hover:bg-error/15 text-muted-foreground hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="p-3 rounded-lg border border-dashed border-border space-y-3">
            <p className="text-sm font-medium flex items-center gap-1"><Plus className="h-4 w-4" /> Add new promo endpoint</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Name" value={newPromo.name} onChange={e => setNewPromo({ ...newPromo, name: e.target.value })} />
              <Input placeholder="URL" value={newPromo.url} onChange={e => setNewPromo({ ...newPromo, url: e.target.value })} />
              <Input placeholder="Description (optional)" value={newPromo.description} onChange={e => setNewPromo({ ...newPromo, description: e.target.value })} />
              <Input type="number" min={1} placeholder="Weight" value={newPromo.weight} onChange={e => setNewPromo({ ...newPromo, weight: Number(e.target.value) })} />
            </div>
            <Button size="sm" onClick={handleAddPromo} disabled={!newPromo.url || !newPromo.name}>
              <Plus className="h-3.5 w-3.5" /> Add Endpoint
            </Button>
          </div>
        </div>
      </Card>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" /> Site Settings</CardTitle>
          <CardDescription>General platform configuration</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Site Name" value={settings?.site_name || ''} onChange={e => setSettings(s => s ? { ...s, site_name: e.target.value } : s)} />
          <Textarea label="Site Description" value={settings?.site_description || ''} onChange={e => setSettings(s => s ? { ...s, site_description: e.target.value } : s)} />
          <Input label="SEO Keywords (comma-separated)" value={settings?.seo_keywords || ''} onChange={e => setSettings(s => s ? { ...s, seo_keywords: e.target.value } : s)} />

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Show a maintenance message to visitors</p>
            </div>
            <Button
              variant={settings?.maintenance_mode ? 'warning' : 'outline'}
              size="sm"
              onClick={() => setSettings(s => s ? { ...s, maintenance_mode: !s.maintenance_mode } : s)}
            >
              {settings?.maintenance_mode ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {settings?.maintenance_mode && (
            <Textarea label="Maintenance Message" value={settings.maintenance_message} onChange={e => setSettings(s => s ? { ...s, maintenance_message: e.target.value } : s)} />
          )}
        </div>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} loading={saving} size="lg">
          <Check className="h-4 w-4" /> Save Settings
        </Button>
        {saved && <p className="text-sm text-success flex items-center gap-1"><Check className="h-4 w-4" /> Saved successfully</p>}
        {error && <p className="text-sm text-error flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}
      </div>
    </div>
  );
}
