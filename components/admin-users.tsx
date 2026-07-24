'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, ShieldOff, Ban, RotateCcw, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/lib/types';

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const loadUsers = (p: number = 1, s: string = '') => {
    setLoading(true);
    fetch(`/api/admin/users?page=${p}&search=${encodeURIComponent(s)}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, search);
  };

  const handleAction = async (userId: string, action: string, reason?: string) => {
    if (action === 'ban' && !reason) {
      reason = prompt('Ban reason?') || 'Violation of terms';
    }
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    if (res.ok) loadUsers(page, search);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{total} total users</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input placeholder="Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
      </form>

      <Card>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium truncate">{user.email}</span>
                    {user.is_admin && <Badge variant="info">Admin</Badge>}
                    {user.is_banned && <Badge variant="error">Banned</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.full_name || 'No name'} &middot; Joined {formatDate(user.created_at)}</p>
                  {user.ban_reason && <p className="text-xs text-error mt-1">Reason: {user.ban_reason}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {user.is_banned ? (
                    <Button size="sm" variant="outline" onClick={() => handleAction(user.id, 'unban')}>
                      <RotateCcw className="h-3.5 w-3.5" /> Unban
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleAction(user.id, 'ban')}>
                      <Ban className="h-3.5 w-3.5" /> Ban
                    </Button>
                  )}
                  {user.is_admin ? (
                    <Button size="sm" variant="ghost" onClick={() => handleAction(user.id, 'remove_admin')}>
                      <ShieldOff className="h-3.5 w-3.5" /> Remove Admin
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleAction(user.id, 'make_admin')}>
                      <Shield className="h-3.5 w-3.5" /> Make Admin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => loadUsers(page - 1, search)}>Previous</Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => loadUsers(page + 1, search)}>Next</Button>
        </div>
      )}
    </div>
  );
}
