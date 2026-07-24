'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Loader2, Users, Link2, Flag, Ban, Settings, TrendingUp,
  MousePointerClick, AlertCircle, CheckCircle2, ExternalLink, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabase-browser';
import type { Profile, Link, AbuseFlag, BlacklistedDomain, PromoUrl, PlatformSettings } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AdminApp() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [allLinks, setAllLinks] = useState<Link[]>([]);
  const [abuseFlags, setAbuseFlags] = useState<AbuseFlag[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistedDomain[]>([]);
  const [promoUrls, setPromoUrls] = useState<PromoUrl[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [newPromoUrl, setNewPromoUrl] = useState('');
  const [newPromoName, setNewPromoName] = useState('');

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      router.push('/dashboard');
      return;
    }
    setIsAuthorized(true);

    const [usersRes, linksRes, flagsRes, blacklistRes, promoRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('links').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('abuse_flags').select('*').order('created_at', { ascending: false }),
      supabase.from('blacklisted_domains').select('*').order('created_at', { ascending: false }),
      supabase.from('promo_urls').select('*').order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle(),
    ]);

    setUsers((usersRes.data as Profile[]) || []);
    setAllLinks((linksRes.data as Link[]) || []);
    setAbuseFlags((flagsRes.data as AbuseFlag[]) || []);
    setBlacklist((blacklistRes.data as BlacklistedDomain[]) || []);
    setPromoUrls((promoRes.data as PromoUrl[]) || []);
    setSettings(settingsRes.data as PlatformSettings);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleAdmin(user: Profile) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !user.is_admin })
      .eq('id', user.id);
    if (error) { toast.error('Failed to update user'); return; }
    setUsers(users.map((u) => (u.id === user.id ? { ...u, is_admin: !u.is_admin } : u)));
    toast.success(`${user.email} ${user.is_admin ? 'removed from admin' : 'promoted to admin'}`);
  }

  async function resolveFlag(id: string) {
    const { error } = await supabase.from('abuse_flags').update({ resolved: true }).eq('id', id);
    if (error) { toast.error('Failed to resolve flag'); return; }
    setAbuseFlags(abuseFlags.map((f) => (f.id === id ? { ...f, resolved: true } : f)));
    toast.success('Flag resolved');
  }

  async function addBlacklistedDomain() {
    if (!newDomain.trim()) return;
    const { error } = await supabase.from('blacklisted_domains').insert({ domain: newDomain.trim() });
    if (error) { toast.error('Failed to add domain'); return; }
    setNewDomain('');
    toast.success('Domain blacklisted');
    loadData();
  }

  async function removeBlacklistedDomain(id: string) {
    const { error } = await supabase.from('blacklisted_domains').delete().eq('id', id);
    if (error) { toast.error('Failed to remove domain'); return; }
    setBlacklist(blacklist.filter((d) => d.id !== id));
    toast.success('Domain removed from blacklist');
  }

  async function addPromoUrl() {
    if (!newPromoUrl.trim() || !newPromoName.trim()) return;
    const { error } = await supabase.from('promo_urls').insert({
      url: newPromoUrl.trim(),
      name: newPromoName.trim(),
      is_active: true,
      weight: 1,
    });
    if (error) { toast.error('Failed to add promo URL'); return; }
    setNewPromoUrl(''); setNewPromoName('');
    toast.success('Promo URL added');
    loadData();
  }

  async function togglePromo(id: string, active: boolean) {
    const { error } = await supabase.from('promo_urls').update({ is_active: !active }).eq('id', id);
    if (error) { toast.error('Failed to update promo URL'); return; }
    setPromoUrls(promoUrls.map((p) => (p.id === id ? { ...p, is_active: !active } : p)));
  }

  async function deleteLink(id: string, alias: string) {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) { toast.error('Failed to delete link'); return; }
    setAllLinks(allLinks.filter((l) => l.id !== id));
    toast.success(`Deleted /${alias}`);
  }

  async function updateSettings(field: string, value: boolean | number) {
    if (!settings) return;
    const { error } = await supabase
      .from('platform_settings')
      .update({ [field]: value })
      .eq('id', 1);
    if (error) { toast.error('Failed to update settings'); return; }
    setSettings({ ...settings, [field]: value });
    toast.success('Settings updated');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="error">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total users" value={users.length.toString()} color="text-primary" />
          <StatCard icon={Link2} label="Total links" value={allLinks.length.toString()} color="text-success" />
          <StatCard icon={Flag} label="Open flags" value={abuseFlags.filter((f) => !f.resolved).length.toString()} color="text-warning" />
          <StatCard icon={Ban} label="Blacklisted" value={blacklist.length.toString()} color="text-destructive" />
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="flags">Flags</TabsTrigger>
            <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3">
            {users.map((u) => (
              <Card key={u.id} className="border-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{u.email}</p>
                    <p className="text-sm text-muted-foreground">{u.full_name || 'No name set'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {u.is_admin && <Badge variant="default">Admin</Badge>}
                    <Button variant="outline" size="sm" onClick={() => toggleAdmin(u)}>
                      {u.is_admin ? 'Remove admin' : 'Make admin'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="links" className="space-y-3">
            {allLinks.map((l) => (
              <Card key={l.id} className="border-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">/{l.alias}</p>
                    <p className="text-sm text-muted-foreground truncate">{l.original_url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {l.total_clicks || 0} clicks
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${l.alias}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLink(l.id, l.alias)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="flags" className="space-y-3">
            {abuseFlags.length === 0 ? (
              <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No abuse flags reported</CardContent></Card>
            ) : (
              abuseFlags.map((f) => (
                <Card key={f.id} className={cn('border-border/60', f.resolved && 'opacity-60')}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={f.severity === 'high' ? 'error' : 'default'}>
                          {f.severity}
                        </Badge>
                        {f.resolved && <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>}
                      </div>
                      <p className="text-sm mt-1">{f.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(f.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!f.resolved && (
                      <Button variant="outline" size="sm" onClick={() => resolveFlag(f.id)}>
                        Resolve
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="blacklist" className="space-y-3">
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input placeholder="domain.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
                  <Button onClick={addBlacklistedDomain}>Add</Button>
                </div>
              </CardContent>
            </Card>
            {blacklist.map((d) => (
              <Card key={d.id} className="border-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{d.domain}</p>
                    <p className="text-xs text-muted-foreground">{d.reason || 'No reason provided'}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeBlacklistedDomain(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {settings && (
              <>
                <Card className="border-border/60">
                  <CardHeader><CardTitle className="text-base">Platform Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Promo enabled</Label>
                        <p className="text-xs text-muted-foreground">Show promotional redirects</p>
                      </div>
                      <Switch checked={settings.promo_enabled} onCheckedChange={(v) => updateSettings('promo_enabled', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Redirect percentage</Label>
                        <p className="text-xs text-muted-foreground">Percentage of clicks that show promo (0-1)</p>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={settings.redirect_percentage}
                        onChange={(e) => updateSettings('redirect_percentage', parseFloat(e.target.value))}
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Signup bonus clicks</Label>
                        <p className="text-xs text-muted-foreground">Free clicks for new users</p>
                      </div>
                      <Input
                        type="number"
                        value={settings.signup_bonus_clicks}
                        onChange={(e) => updateSettings('signup_bonus_clicks', parseInt(e.target.value))}
                        className="w-24"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader><CardTitle className="text-base">Promo URLs</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input placeholder="Promo URL" value={newPromoUrl} onChange={(e) => setNewPromoUrl(e.target.value)} />
                      <Input placeholder="Name" value={newPromoName} onChange={(e) => setNewPromoName(e.target.value)} />
                    </div>
                    <Button onClick={addPromoUrl} size="sm">Add promo URL</Button>

                    {promoUrls.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.url}</p>
                          <p className="text-xs text-muted-foreground mt-1">{p.total_sends} sends</p>
                        </div>
                        <Switch checked={p.is_active} onCheckedChange={() => togglePromo(p.id, p.is_active)} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
