'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Trash2,
  Link2,
  ExternalLink,
  QrCode,
  Eye,
  Clock,
  Calendar,
  MousePointerClick,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { formatNumber, timeAgo, truncate, formatDateTime } from '@/lib/utils';

interface AdminLink {
  id: string;
  alias: string;
  destination_url: string;
  title: string | null;
  is_active: boolean;
  is_guest: boolean;
  expires_at: string | null;
  total_clicks: number;
  promo_clicks: number;
  created_at: string;
  updated_at: string;
  creator_id: string | null;
  workspace_id: string | null;
  creator: { id: string; email: string; full_name: string } | null;
  workspace: { id: string; name: string; slug: string } | null;
  status: 'active' | 'expired' | 'disabled' | 'expiring';
}

type StatusFilter = 'all' | 'active' | 'expired' | 'disabled' | 'expiring';
type UserTypeFilter = 'all' | 'guest' | 'registered';
type SortBy = 'created_at' | 'total_clicks' | 'expires_at' | 'alias';

export function AdminLinks() {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const loadLinks = useCallback(
    (p: number, s: string, status: StatusFilter, userType: UserTypeFilter, sort: SortBy, order: 'asc' | 'desc') => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(p),
        limit: String(limit),
        search: s,
        status,
        userType,
        sortBy: sort,
        sortOrder: order,
      });
      fetch(`/api/admin/links?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setLinks(data.links || []);
          setTotal(data.total || 0);
          setPage(p);
        })
        .finally(() => setLoading(false));
    },
    [limit]
  );

  useEffect(() => {
    loadLinks(1, activeSearch, statusFilter, userTypeFilter, sortBy, sortOrder);
  }, [activeSearch, statusFilter, userTypeFilter, sortBy, sortOrder, loadLinks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setUserTypeFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setSearch('');
    setActiveSearch('');
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Delete this link permanently? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/links?id=${linkId}`, { method: 'DELETE' });
    if (res.ok) loadLinks(page, activeSearch, statusFilter, userTypeFilter, sortBy, sortOrder);
  };

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = statusFilter !== 'all' || userTypeFilter !== 'all' || activeSearch !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Link Management</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(total)} total links
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {(statusFilter !== 'all' ? 1 : 0) + (userTypeFilter !== 'all' ? 1 : 0) + (activeSearch ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by alias, URL, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {showFilters && (
        <Card className="p-4 animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              {(['all', 'active', 'expiring', 'expired', 'disabled'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Type:</span>
              {(['all', 'registered', 'guest'] as UserTypeFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setUserTypeFilter(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    userTypeFilter === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                <option value="created_at">Created Date</option>
                <option value="total_clicks">Total Clicks</option>
                <option value="expires_at">Expiry Date</option>
                <option value="alias">Alias</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
              >
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16">
            <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No links found</p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="mt-3">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {links.map((link) => (
              <LinkRow key={link.id} link={link} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => loadLinks(page - 1, activeSearch, statusFilter, userTypeFilter, sortBy, sortOrder)}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => loadLinks(page + 1, activeSearch, statusFilter, userTypeFilter, sortBy, sortOrder)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AdminLink['status'] }) {
  const config = {
    active: { variant: 'success' as const, label: 'Active', dot: 'bg-success' },
    expiring: { variant: 'warning' as const, label: 'Expiring Soon', dot: 'bg-warning' },
    expired: { variant: 'error' as const, label: 'Expired', dot: 'bg-error' },
    disabled: { variant: 'secondary' as const, label: 'Disabled', dot: 'bg-muted-foreground' },
  };
  const c = config[status];
  return (
    <Badge variant={c.variant}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </Badge>
  );
}

function LinkRow({ link, onDelete }: { link: AdminLink; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const shortUrl = `/${link.alias}`;
  const remainingTime = link.expires_at
    ? getRemainingTime(link.expires_at)
    : null;

  return (
    <div className="hover:bg-muted/30 transition-colors">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-semibold font-mono">{shortUrl}</span>
            <StatusBadge status={link.status} />
            {link.is_guest && <Badge variant="outline">Guest</Badge>}
            {link.workspace && <Badge variant="info">{link.workspace.name}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate mb-1.5" title={link.destination_url}>
            {truncate(link.destination_url, 70)}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" />
              {formatNumber(link.total_clicks)} clicks
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {link.creator?.email || link.creator?.full_name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {timeAgo(link.created_at)}
            </span>
            {link.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {remainingTime}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <a
            href={`/${link.alias}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href={`/api/qr/${link.alias}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="QR code"
          >
            <QrCode className="h-4 w-4" />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(link.id); }}
            className="p-2 rounded-lg hover:bg-error/15 text-muted-foreground hover:text-error transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <DetailField label="Destination URL" value={link.destination_url} mono />
            <DetailField label="Alias" value={link.alias} mono />
            <DetailField label="Title" value={link.title || '—'} />
            <DetailField label="Creator Name" value={link.creator?.full_name || '—'} />
            <DetailField label="Creator Email" value={link.creator?.email || '—'} />
            <DetailField label="User ID" value={link.creator_id || '—'} mono />
            <DetailField label="Workspace" value={link.workspace?.name || 'None'} />
            <DetailField label="Created" value={formatDateTime(link.created_at)} />
            <DetailField
              label="Expiry"
              value={link.expires_at ? formatDateTime(link.expires_at) : 'Never'}
            />
            <DetailField
              label="Remaining Time"
              value={remainingTime || 'No expiry'}
            />
            <DetailField label="Total Clicks" value={formatNumber(link.total_clicks)} />
            <DetailField label="Promo Clicks" value={formatNumber(link.promo_clicks)} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function getRemainingTime(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms < 0) return 'Expired';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
