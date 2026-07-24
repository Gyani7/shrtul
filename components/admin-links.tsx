'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Link2, ExternalLink, QrCode } from 'lucide-react';
import { formatNumber, timeAgo, truncate } from '@/lib/utils';
import type { Link } from '@/lib/types';

export function AdminLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const loadLinks = (p: number = 1, s: string = '') => {
    setLoading(true);
    fetch(`/api/admin/links?page=${p}&search=${encodeURIComponent(s)}`)
      .then(res => res.json())
      .then(data => {
        setLinks(data.links || []);
        setTotal(data.total || 0);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLinks(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLinks(1, search);
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Delete this link permanently?')) return;
    const res = await fetch(`/api/admin/links?id=${linkId}`, { method: 'DELETE' });
    if (res.ok) loadLinks(page, search);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Links</h1>
        <p className="text-sm text-muted-foreground">{total} total links</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input placeholder="Search links..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
      </form>

      <Card>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No links found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium">/{link.alias}</span>
                    {link.is_guest && <Badge variant="warning">Guest</Badge>}
                    {!link.is_active && <Badge variant="error">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{truncate(link.original_url, 60)}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{formatNumber(link.total_clicks)} clicks</span>
                    <span>{timeAgo(link.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={`/${link.alias}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a href={`/api/qr/${link.alias}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                    <QrCode className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDelete(link.id)} className="p-2 rounded-lg hover:bg-error/15 text-muted-foreground hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => loadLinks(page - 1, search)}>Previous</Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => loadLinks(page + 1, search)}>Next</Button>
        </div>
      )}
    </div>
  );
}
