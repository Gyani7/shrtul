'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Shield,
  ShieldOff,
  Ban,
  RotateCcw,
  Users as UsersIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  MousePointerClick,
  Link2,
  X,
} from 'lucide-react';
import { formatNumber, formatDate, timeAgo } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  total_links: number;
  active_links: number;
  expired_links: number;
  total_clicks: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(
    (p: number, s: string) => {
      setLoading(true);
      fetch(`/api/admin/users?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}`)
        .then((res) => res.json())
        .then((data) => {
          setUsers(data.users || []);
          setTotal(data.total || 0);
          setPage(p);
        })
        .finally(() => setLoading(false));
    },
    [limit]
  );

  useEffect(() => {
    loadUsers(1, activeSearch);
  }, [activeSearch, loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handleAction = async (userId: string, action: string, reason?: string) => {
    if (action === 'ban' && !reason) {
      reason = prompt('Ban reason?') || 'Violation of terms';
    }
    if (action === 'delete') {
      if (!confirm('Delete this user and all their links permanently? This cannot be undone.')) return;
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        loadUsers(page, activeSearch);
        setSelectedUser(null);
      }
      return;
    }
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    if (res.ok) loadUsers(page, activeSearch);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">{formatNumber(total)} total users</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onAction={handleAction} onView={() => setSelectedUser(user)} />
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => loadUsers(page - 1, activeSearch)}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => loadUsers(page + 1, activeSearch)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {selectedUser && (
        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onAction={handleAction} />
      )}
    </div>
  );
}

function UserRow({
  user,
  onAction,
  onView,
}: {
  user: AdminUser;
  onAction: (userId: string, action: string, reason?: string) => void;
  onView: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-medium truncate">{user.full_name || user.email}</span>
          {user.is_admin && <Badge variant="info">Admin</Badge>}
          {user.is_banned ? (
            <Badge variant="error">Banned</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {user.email}
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            {user.total_links} links ({user.active_links} active)
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick className="h-3 w-3" />
            {formatNumber(user.total_clicks)} clicks
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Joined {formatDate(user.created_at)}
          </span>
        </div>
        {user.ban_reason && <p className="text-xs text-error mt-1">Reason: {user.ban_reason}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button size="sm" variant="ghost" onClick={onView}>
          View
        </Button>
        {user.is_banned ? (
          <Button size="sm" variant="outline" onClick={() => onAction(user.id, 'unban')}>
            <RotateCcw className="h-3.5 w-3.5" /> Enable
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onAction(user.id, 'ban')}>
            <Ban className="h-3.5 w-3.5" /> Disable
          </Button>
        )}
        {user.is_admin ? (
          <Button size="sm" variant="ghost" onClick={() => onAction(user.id, 'remove_admin')}>
            <ShieldOff className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => onAction(user.id, 'make_admin')}>
            <Shield className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function UserDetailDrawer({
  user,
  onClose,
  onAction,
}: {
  user: AdminUser;
  onClose: () => void;
  onAction: (userId: string, action: string, reason?: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border h-full overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">User Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-lg">
              {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{user.full_name || 'No name'}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {user.is_admin && <Badge variant="info">Admin</Badge>}
            {user.is_banned ? <Badge variant="error">Banned</Badge> : <Badge variant="success">Active</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Links" value={formatNumber(user.total_links)} />
            <StatCard label="Active Links" value={formatNumber(user.active_links)} />
            <StatCard label="Expired Links" value={formatNumber(user.expired_links)} />
            <StatCard label="Total Clicks" value={formatNumber(user.total_clicks)} />
          </div>

          <div className="space-y-2">
            <DetailRow label="User ID" value={user.id} mono />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Full Name" value={user.full_name || '—'} />
            <DetailRow label="Joined" value={formatDate(user.created_at)} />
            <DetailRow label="Last Updated" value={timeAgo(user.updated_at)} />
            {user.ban_reason && <DetailRow label="Ban Reason" value={user.ban_reason} />}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-sm font-semibold">Actions</h3>
            {user.is_banned ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAction(user.id, 'unban')}
              >
                <RotateCcw className="h-4 w-4" /> Enable User
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAction(user.id, 'ban')}
              >
                <Ban className="h-4 w-4" /> Disable User
              </Button>
            )}
            {user.is_admin ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAction(user.id, 'remove_admin')}
              >
                <ShieldOff className="h-4 w-4" /> Remove Admin
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAction(user.id, 'make_admin')}
              >
                <Shield className="h-4 w-4" /> Make Admin
              </Button>
            )}
            <Button
              variant="danger"
              className="w-full"
              onClick={() => onAction(user.id, 'delete')}
            >
              <Trash2 className="h-4 w-4" /> Delete User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-border/30">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
