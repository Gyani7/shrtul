'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy, Check, Trash2, ExternalLink, QrCode, BarChart3, Link2,
  Loader2, Search, Plus, TrendingUp, MousePointerClick, Clock,
  Globe, Smartphone, Monitor, MoreVertical, Edit3, Eye, EyeOff,
  ArrowLeft, Calendar, Lock as LockIcon, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabase-browser';
import { generateShortCode, isValidUrl, normalizeUrl, isSafeUrl, getDomainFromUrl, getFaviconUrl } from '@/lib/shortener';
import type { Link, Click, Profile } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DashboardApp() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<Record<string, Click[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    setUser(profile as Profile | null);

    const { data: wsData } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', session.user.id)
      .limit(1);

    let ws = wsData?.[0];
    if (!ws) {
      await supabase.rpc('ensure_user_workspace');
      const { data: wsRetry } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', session.user.id)
        .limit(1);
      ws = wsRetry?.[0];
    }
    if (!ws) {
      setLoading(false);
      return;
    }

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('workspace_id', ws.id)
      .order('created_at', { ascending: false });

    setLinks((linksData as Link[]) || []);

    if (linksData && linksData.length > 0) {
      const linkIds = linksData.map((l) => l.id);
      const { data: clicksData } = await supabase
        .from('clicks')
        .select('*')
        .in('link_id', linkIds)
        .order('created_at', { ascending: false })
        .limit(500);

      const clicksMap: Record<string, Click[]> = {};
      (clicksData as Click[])?.forEach((c) => {
        if (!clicksMap[c.link_id]) clicksMap[c.link_id] = [];
        clicksMap[c.link_id].push(c);
      });
      setClicks(clicksMap);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (sessionReady) loadData();
  }, [sessionReady, loadData]);

  function copyLink(alias: string) {
    const shortUrl = `${window.location.origin}/${alias}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(alias);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard!');
  }

  async function deleteLink(id: string) {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete link');
      return;
    }
    setLinks(links.filter((l) => l.id !== id));
    toast.success('Link deleted');
  }

  async function toggleActive(link: Link) {
    const { error } = await supabase
      .from('links')
      .update({ is_active: !link.is_active })
      .eq('id', link.id);
    if (error) {
      toast.error('Failed to update link');
      return;
    }
    setLinks(links.map((l) => (l.id === link.id ? { ...l, is_active: !l.is_active } : l)));
    toast.success(link.is_active ? 'Link deactivated' : 'Link activated');
  }

  const filteredLinks = links.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.alias.toLowerCase().includes(q) ||
      l.original_url.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q)
    );
  });

  const totalClicks = links.reduce((sum, l) => sum + (l.total_clicks || 0), 0);
  const activeLinks = links.filter((l) => l.is_active).length;
  const expiredLinks = links.filter((l) => l.expires_at && new Date(l.expires_at) < new Date()).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Logo />
            <Badge variant="default" className="hidden sm:inline-flex">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New link
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Link2} label="Total links" value={links.length.toString()} color="text-primary" />
          <StatCard icon={MousePointerClick} label="Total clicks" value={totalClicks.toLocaleString()} color="text-success" />
          <StatCard icon={TrendingUp} label="Active links" value={activeLinks.toString()} color="text-warning" />
          <StatCard icon={Clock} label="Expired" value={expiredLinks.toString()} color="text-destructive" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Links list */}
        {filteredLinks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Link2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {search ? 'No links found' : 'No links yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? 'Try a different search term' : 'Create your first short link to get started'}
              </p>
              {!search && (
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first link
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLinks.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                clicks={clicks[link.id] || []}
                copied={copiedId === link.alias}
                onCopy={() => copyLink(link.alias)}
                onDelete={() => deleteLink(link.id)}
                onToggle={() => toggleActive(link)}
                onView={() => setSelectedLink(link)}
                onEdit={() => setEditingLink(link)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <CreateLinkDialog open={showCreate} onOpenChange={setShowCreate} onCreated={loadData} />

      {/* Edit dialog */}
      {editingLink && (
        <EditLinkDialog
          link={editingLink}
          onClose={() => setEditingLink(null)}
          onSaved={() => {
            setEditingLink(null);
            loadData();
          }}
        />
      )}

      {/* Analytics dialog */}
      {selectedLink && (
        <AnalyticsDialog link={selectedLink} clicks={clicks[selectedLink.id] || []} onClose={() => setSelectedLink(null)} />
      )}
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

function LinkRow({
  link, clicks, copied, onCopy, onDelete, onToggle, onView, onEdit,
}: {
  link: Link; clicks: Click[]; copied: boolean;
  onCopy: () => void; onDelete: () => void; onToggle: () => void; onView: () => void; onEdit: () => void;
}) {
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  const domain = getDomainFromUrl(link.original_url);

  return (
    <Card className="border-border/60 transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFaviconUrl(link.original_url)}
              alt=""
              className="h-8 w-8 rounded mt-0.5 shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${link.alias}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline truncate"
                >
                  /{link.alias}
                </a>
                {link.is_active ? (
                  <Badge variant="default" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="default" className="text-xs">Inactive</Badge>
                )}
                {isExpired && <Badge variant="error" className="text-xs">Expired</Badge>}
                {link.password_hash && (
                  <Badge variant="info" className="text-xs">
                    <LockIcon className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                )}
                {link.is_guest && (
                  <Badge variant="info" className="text-xs">Guest</Badge>
                )}
              </div>
              {link.title && <p className="text-sm font-medium mt-1 truncate">{link.title}</p>}
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {link.original_url}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  {link.total_clicks || 0} clicks
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(link.created_at).toLocaleDateString()}
                </span>
                <span className="hidden sm:inline">{domain}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
              <BarChart3 className="h-4 w-4" />
            </Button>
            <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${link.alias}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggle}>
                  {link.is_active ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {link.is_active ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateLinkDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const normalized = normalizeUrl(url.trim());
    if (!isValidUrl(normalized)) { setError('Please enter a valid URL'); return; }
    if (!isSafeUrl(normalized)) { setError('This URL type is not allowed'); return; }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please sign in'); setLoading(false); return; }

      const { data: wsData } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', session.user.id)
        .limit(1);
      const ws = wsData?.[0];
      if (!ws) { setError('No workspace found'); setLoading(false); return; }

      const insertData: Record<string, unknown> = {
        original_url: normalized,
        alias: alias.trim() || generateShortCode(),
        title: title.trim(),
        workspace_id: ws.id,
        creator_id: session.user.id,
        is_active: true,
        is_guest: false,
      };

      if (password) {
        const { data: hashData, error: hashError } = await supabase
          .rpc('hash_password', { pw: password });
        if (hashError) {
          setError('Failed to set password');
          setLoading(false);
          return;
        }
        insertData.password_hash = hashData;
      }

      if (expiresAt) {
        insertData.expires_at = new Date(expiresAt).toISOString();
      }

      const { error: insertError } = await supabase.from('links').insert(insertData);
      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          setError('That alias is already taken');
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      toast.success('Link created!');
      setUrl(''); setAlias(''); setTitle(''); setPassword(''); setExpiresAt(''); setShowAdvanced(false);
      onOpenChange(false);
      onCreated();
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new short link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-url">Destination URL</Label>
            <Input id="create-url" placeholder="https://example.com/very/long/url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-alias">Custom alias (optional)</Label>
            <Input id="create-alias" placeholder="my-link" value={alias} onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-title">Title (optional)</Label>
            <Input id="create-title" placeholder="My awesome link" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
          </div>

          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
            Advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="create-password">Password protection</Label>
                <Input id="create-password" type="password" placeholder="Leave empty for no password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-expires">Expiry date</Label>
                <Input id="create-expires" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditLinkDialog({ link, onClose, onSaved }: { link: Link; onClose: () => void; onSaved: () => void }) {
  const [url, setUrl] = useState(link.original_url);
  const [title, setTitle] = useState(link.title || '');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState(
    link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please sign in'); setLoading(false); return; }

      const updateData: Record<string, unknown> = {
        title: title.trim(),
      };

      if (url !== link.original_url) {
        const normalized = normalizeUrl(url.trim());
        if (!isValidUrl(normalized) || !isSafeUrl(normalized)) {
          setError('Invalid URL');
          setLoading(false);
          return;
        }
        updateData.original_url = normalized;
      }

      if (password !== '') {
        const { data: hashData, error: hashError } = await supabase
          .rpc('hash_password', { pw: password });
        if (hashError) {
          setError('Failed to set password');
          setLoading(false);
          return;
        }
        updateData.password_hash = hashData;
      }

      if (expiresAt !== '') {
        updateData.expires_at = new Date(expiresAt).toISOString();
      } else if (link.expires_at) {
        updateData.expires_at = null;
      }

      const { error: updateError } = await supabase
        .from('links')
        .update(updateData)
        .eq('id', link.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      toast.success('Link updated!');
      onSaved();
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-url">Destination URL</Label>
            <Input id="edit-url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
            <Input id="edit-password" type="password" placeholder="Enter new password to change" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expires">Expiry date (leave empty to remove)</Label>
            <Input id="edit-expires" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnalyticsDialog({ link, clicks, onClose }: { link: Link; clicks: Click[]; onClose: () => void }) {
  const countryStats = clicks.reduce<Record<string, number>>((acc, c) => {
    const k = c.country || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const browserStats = clicks.reduce<Record<string, number>>((acc, c) => {
    const k = c.browser || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const deviceStats = clicks.reduce<Record<string, number>>((acc, c) => {
    const k = c.device || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const recentClicks = clicks.slice(0, 10);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics for /{link.alias}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{link.total_clicks || 0}</p>
            <p className="text-xs text-muted-foreground">Total clicks</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{clicks.filter((c) => !c.is_promo_redirect).length}</p>
            <p className="text-xs text-muted-foreground">Real clicks</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{link.promo_clicks || 0}</p>
            <p className="text-xs text-muted-foreground">Promo sends</p>
          </div>
        </div>

        <Tabs defaultValue="recent">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="country">Country</TabsTrigger>
            <TabsTrigger value="browser">Browser</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-2 mt-4">
            {recentClicks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No clicks recorded yet</p>
            ) : (
              recentClicks.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{c.country || 'Unknown'}</span>
                    {c.is_promo_redirect && <Badge variant="default" className="text-xs">Promo</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="country" className="space-y-2 mt-4">
            {Object.entries(countryStats).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
              <StatBar key={country} label={country} value={count} max={Math.max(...Object.values(countryStats))} icon={<Globe className="h-4 w-4" />} />
            ))}
          </TabsContent>

          <TabsContent value="browser" className="space-y-2 mt-4">
            {Object.entries(browserStats).sort((a, b) => b[1] - a[1]).map(([browser, count]) => (
              <StatBar key={browser} label={browser} value={count} max={Math.max(...Object.values(browserStats))} />
            ))}
          </TabsContent>

          <TabsContent value="device" className="space-y-2 mt-4">
            {Object.entries(deviceStats).sort((a, b) => b[1] - a[1]).map(([device, count]) => (
              <StatBar key={device} label={device} value={count} max={Math.max(...Object.values(deviceStats))} icon={device === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />} />
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function StatBar({ label, value, max, icon }: { label: string; value: number; max: number; icon?: React.ReactNode }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-24 text-sm shrink-0">
        {icon}
        {label}
      </div>
      <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
        <div className="h-full bg-primary/80 transition-all flex items-center justify-end px-2" style={{ width: `${pct}%` }}>
          <span className="text-xs font-medium text-primary-foreground">{value}</span>
        </div>
      </div>
    </div>
  );
}
