import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const { authorized, client } = await checkAdmin();
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status') || 'all';
    const userType = searchParams.get('userType') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Build the base query with creator and workspace joins via embedded selects
    let query = admin
      .from('links')
      .select(
        'id, alias, destination_url, title, is_active, is_guest, expires_at, total_clicks, promo_clicks, created_at, updated_at, creator_id, workspace_id, creator:profiles!links_creator_id_fkey(id, email, full_name), workspace:workspaces!links_workspace_id_fkey(id, name, slug)',
        { count: 'exact' }
      );

    // Search across multiple fields
    if (search) {
      // Search by alias, destination_url, title, or creator email/name (via separate approach)
      query = query.or(
        `alias.ilike.%${search}%,destination_url.ilike.%${search}%,title.ilike.%${search}%`
      );
    }

    // Status filters
    if (status === 'active') {
      query = query.eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`);
    } else if (status === 'expired') {
      query = query.not('expires_at', 'is', null).lt('expires_at', now);
    } else if (status === 'disabled') {
      query = query.eq('is_active', false);
    } else if (status === 'expiring') {
      // Expiring within 24 hours
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      query = query.not('expires_at', 'is', null).gte('expires_at', now).lte('expires_at', tomorrow);
    }

    // User type filters
    if (userType === 'guest') {
      query = query.eq('is_guest', true);
    } else if (userType === 'registered') {
      query = query.eq('is_guest', false);
    }

    // Sorting
    const validSorts = ['created_at', 'total_clicks', 'expires_at', 'alias'];
    const sortCol = validSorts.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortCol, { ascending: sortOrder === 'asc' });

    query = query.range(offset, offset + limit - 1);

    const { data: links, count, error } = await query;
    if (error) throw error;

    // If searching by email/username, filter the results that matched creator fields
    // (PostgREST doesn't support filtering on joined tables in the same query)
    let filteredLinks = links || [];

    // For email/username search, we need to filter post-query since or() above only covers link fields
    const looksLikeEmail = search.includes('@');
    if (search && (looksLikeEmail || status === 'all')) {
      // Check if any results have matching creator — if none matched link fields, try creator search
      if (filteredLinks.length === 0 && search) {
        const { data: matchingUsers } = await admin
          .from('profiles')
          .select('id')
          .or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
          .limit(100);

        if (matchingUsers && matchingUsers.length > 0) {
          const userIds = matchingUsers.map((u) => u.id);
          const { data: creatorLinks, count: creatorCount } = await admin
            .from('links')
            .select(
              'id, alias, destination_url, title, is_active, is_guest, expires_at, total_clicks, promo_clicks, created_at, updated_at, creator_id, workspace_id, creator:profiles!links_creator_id_fkey(id, email, full_name), workspace:workspaces!links_workspace_id_fkey(id, name, slug)',
              { count: 'exact' }
            )
            .in('creator_id', userIds)
            .order(sortCol, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

          filteredLinks = creatorLinks || [];
          return NextResponse.json({
            links: filteredLinks.map((l) => normalizeLink(l, now)),
            total: creatorCount || 0,
            page,
            limit,
          });
        }
      }
    }

    return NextResponse.json({
      links: filteredLinks.map((l) => normalizeLink(l, now)),
      total: count || 0,
      page,
      limit,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, client } = await checkAdmin();
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('id');

    if (!linkId) return NextResponse.json({ error: 'Link ID required' }, { status: 400 });

    const { error } = await client.from('links').delete().eq('id', linkId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

function normalizeLink(l: any, now: string) {
  const creator = Array.isArray(l.creator) ? l.creator[0] : l.creator;
  const workspace = Array.isArray(l.workspace) ? l.workspace[0] : l.workspace;
  const expiresAt = l.expires_at;
  const isActive = l.is_active;
  let status: 'active' | 'expired' | 'disabled' | 'expiring' = 'active';

  if (!isActive) {
    status = 'disabled';
  } else if (expiresAt) {
    const expiry = new Date(expiresAt).getTime();
    const nowMs = new Date(now).getTime();
    if (expiry < nowMs) {
      status = 'expired';
    } else if (expiry - nowMs < 24 * 60 * 60 * 1000) {
      status = 'expiring';
    }
  }

  return {
    id: l.id,
    alias: l.alias,
    destination_url: l.destination_url,
    title: l.title,
    is_active: l.is_active,
    is_guest: l.is_guest,
    expires_at: l.expires_at,
    total_clicks: l.total_clicks || 0,
    promo_clicks: l.promo_clicks || 0,
    created_at: l.created_at,
    updated_at: l.updated_at,
    creator_id: l.creator_id,
    workspace_id: l.workspace_id,
    creator: creator
      ? { id: creator.id, email: creator.email, full_name: creator.full_name }
      : null,
    workspace: workspace
      ? { id: workspace.id, name: workspace.name, slug: workspace.slug }
      : null,
    status,
  };
}
