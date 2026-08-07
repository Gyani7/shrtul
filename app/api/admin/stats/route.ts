import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { authorized } = await checkAdmin();
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const admin = getSupabaseAdmin();
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Run queries in parallel
    const [usersResult, linksResult, clicksResult, activeLinksResult, expiredLinksResult, disabledLinksResult, guestLinksResult, clicksTodayResult, expiringLinksResult] =
      await Promise.all([
        admin.from('profiles').select('id', { count: 'exact', head: true }),
        admin.from('links').select('id', { count: 'exact', head: true }),
        admin.from('clicks').select('id', { count: 'exact', head: true }),
        admin.from('links').select('id', { count: 'exact', head: true }).eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`),
        admin.from('links').select('id', { count: 'exact', head: true }).not('expires_at', 'is', null).lt('expires_at', now.toISOString()),
        admin.from('links').select('id', { count: 'exact', head: true }).eq('is_active', false),
        admin.from('links').select('id', { count: 'exact', head: true }).eq('is_guest', true),
        admin.from('clicks').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        admin.from('links').select('id', { count: 'exact', head: true }).not('expires_at', 'is', null).gte('expires_at', now.toISOString()).lte('expires_at', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()),
      ]);

    // Active users (logged in within 30 days — approximate via updated_at on profiles)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers30d } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo);

    // Top users by total clicks
    const { data: topUsersData } = await admin
      .from('links')
      .select('creator_id, total_clicks, creator:profiles!links_creator_id_fkey(id, email, full_name)')
      .not('creator_id', 'is', null)
      .order('total_clicks', { ascending: false })
      .limit(50);

    const userClickMap: Record<string, { email: string; full_name: string; total_clicks: number; total_links: number }> = {};
    topUsersData?.forEach((l: any) => {
      const uid = l.creator_id;
      if (!uid) return;
      const creator = Array.isArray(l.creator) ? l.creator[0] : l.creator;
      if (!userClickMap[uid]) {
        userClickMap[uid] = {
          email: creator?.email || 'Unknown',
          full_name: creator?.full_name || '',
          total_clicks: 0,
          total_links: 0,
        };
      }
      userClickMap[uid].total_clicks += l.total_clicks || 0;
      userClickMap[uid].total_links += 1;
    });

    const topUsers = Object.entries(userClickMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total_clicks - a.total_clicks)
      .slice(0, 10);

    // Top links by clicks
    const { data: topLinks } = await admin
      .from('links')
      .select('id, alias, destination_url, total_clicks, created_at')
      .order('total_clicks', { ascending: false })
      .limit(10);

    // Daily clicks for last 30 days
    const thirtyDaysAgoDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: clicksTimeline } = await admin
      .from('clicks')
      .select('created_at')
      .gte('created_at', thirtyDaysAgoDate.toISOString())
      .order('created_at', { ascending: true });

    const clicksByDay: Record<string, number> = {};
    clicksTimeline?.forEach((c) => {
      const day = new Date(c.created_at).toISOString().split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    });

    // User registrations for last 30 days
    const { data: registrationsTimeline } = await admin
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgoDate.toISOString())
      .order('created_at', { ascending: true });

    const registrationsByDay: Record<string, number> = {};
    registrationsTimeline?.forEach((p) => {
      const day = new Date(p.created_at).toISOString().split('T')[0];
      registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
    });

    // Monthly growth (links per month for last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const { data: linksGrowth } = await admin
      .from('links')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    const linksByMonth: Record<string, number> = {};
    linksGrowth?.forEach((l) => {
      const d = new Date(l.created_at);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      linksByMonth[month] = (linksByMonth[month] || 0) + 1;
    });

    return NextResponse.json({
      total_users: usersResult.count || 0,
      active_users_30d: activeUsers30d || 0,
      total_links: linksResult.count || 0,
      active_links: activeLinksResult.count || 0,
      expired_links: expiredLinksResult.count || 0,
      disabled_links: disabledLinksResult.count || 0,
      guest_links: guestLinksResult.count || 0,
      permanent_links: (linksResult.count || 0) - (guestLinksResult.count || 0),
      total_clicks: clicksResult.count || 0,
      clicks_today: clicksTodayResult.count || 0,
      expiring_links: expiringLinksResult.count || 0,
      top_users: topUsers,
      top_links: topLinks || [],
      clicks_timeline: Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks })),
      registrations_timeline: Object.entries(registrationsByDay).map(([date, count]) => ({ date, count })),
      links_by_month: Object.entries(linksByMonth).map(([month, count]) => ({ month, count })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
