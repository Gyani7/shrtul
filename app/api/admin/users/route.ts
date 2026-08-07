import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const { authorized } = await checkAdmin();
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const admin = getSupabaseAdmin();

    let query = admin
      .from('profiles')
      .select('id, email, full_name, avatar_url, is_admin, is_banned, ban_reason, created_at, updated_at', {
        count: 'exact',
      });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;
    if (error) throw error;

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [], total: count || 0, page, limit });
    }

    // Batch fetch link stats and click stats for all users on this page
    const userIds = users.map((u) => u.id);
    const now = new Date().toISOString();

    const { data: linkStats } = await admin
      .from('links')
      .select('creator_id, is_active, expires_at, total_clicks, is_guest')
      .in('creator_id', userIds);

    // Aggregate per user
    const userStatsMap: Record<
      string,
      { total_links: number; active_links: number; expired_links: number; total_clicks: number }
    > = {};

    linkStats?.forEach((link) => {
      const uid = link.creator_id;
      if (!uid) return;
      if (!userStatsMap[uid]) {
        userStatsMap[uid] = { total_links: 0, active_links: 0, expired_links: 0, total_clicks: 0 };
      }
      userStatsMap[uid].total_links++;
      userStatsMap[uid].total_clicks += link.total_clicks || 0;

      if (!link.is_active) {
        // disabled — not counted as active or expired
      } else if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
        userStatsMap[uid].expired_links++;
      } else {
        userStatsMap[uid].active_links++;
      }
    });

    const usersWithStats = users.map((user) => ({
      ...user,
      total_links: userStatsMap[user.id]?.total_links || 0,
      active_links: userStatsMap[user.id]?.active_links || 0,
      expired_links: userStatsMap[user.id]?.expired_links || 0,
      total_clicks: userStatsMap[user.id]?.total_clicks || 0,
    }));

    return NextResponse.json({ users: usersWithStats, total: count || 0, page, limit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
