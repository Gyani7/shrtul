import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized } = await checkAdmin();
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Get link with creator and workspace
    const { data: link, error: linkError } = await admin
      .from('links')
      .select(
        'id, alias, destination_url, title, description, is_active, is_guest, expires_at, total_clicks, promo_clicks, created_at, updated_at, creator_id, workspace_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content, geo_targets, device_targets, password_hash, guest_session_id, is_featured, creator:profiles!links_creator_id_fkey(id, email, full_name, created_at), workspace:workspaces!links_workspace_id_fkey(id, name, slug)'
      )
      .eq('id', params.id)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 });

    const creator = Array.isArray(link.creator) ? link.creator[0] : link.creator;
    const workspace = Array.isArray(link.workspace) ? link.workspace[0] : link.workspace;

    // Get today's clicks count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayClicks } = await admin
      .from('clicks')
      .select('id', { count: 'exact', head: true })
      .eq('link_id', params.id)
      .gte('created_at', todayStart.toISOString());

    // Get last click time
    const { data: lastClick } = await admin
      .from('clicks')
      .select('created_at')
      .eq('link_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get click analytics breakdowns
    const { data: deviceBreakdown } = await admin
      .from('clicks')
      .select('device')
      .eq('link_id', params.id)
      .not('device', 'is', null);

    const { data: browserBreakdown } = await admin
      .from('clicks')
      .select('browser')
      .eq('link_id', params.id)
      .not('browser', 'is', null);

    const { data: osBreakdown } = await admin
      .from('clicks')
      .select('os')
      .eq('link_id', params.id)
      .not('os', 'is', null);

    const { data: countryBreakdown } = await admin
      .from('clicks')
      .select('country')
      .eq('link_id', params.id)
      .not('country', 'is', null);

    const { data: cityBreakdown } = await admin
      .from('clicks')
      .select('city')
      .eq('link_id', params.id)
      .not('city', 'is', null);

    const { data: refererBreakdown } = await admin
      .from('clicks')
      .select('referer')
      .eq('link_id', params.id)
      .not('referer', 'is', null);

    // Get click timeline (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: timeline } = await admin
      .from('clicks')
      .select('created_at')
      .eq('link_id', params.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Get recent clicks (last 20)
    const { data: recentClicks } = await admin
      .from('clicks')
      .select('id, country, city, browser, os, device, referer, is_unique, is_promo_redirect, created_at')
      .eq('link_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Compute status
    let status: 'active' | 'expired' | 'disabled' | 'expiring' = 'active';
    if (!link.is_active) {
      status = 'disabled';
    } else if (link.expires_at) {
      const expiry = new Date(link.expires_at).getTime();
      const nowMs = Date.now();
      if (expiry < nowMs) {
        status = 'expired';
      } else if (expiry - nowMs < 24 * 60 * 60 * 1000) {
        status = 'expiring';
      }
    }

    // Aggregate breakdowns
    const aggregate = (items: any[] | null, field: string) => {
      const counts: Record<string, number> = {};
      items?.forEach((item) => {
        const val = item[field] || 'Unknown';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    // Aggregate timeline by day
    const timelineByDay: Record<string, number> = {};
    timeline?.forEach((click) => {
      const day = new Date(click.created_at).toISOString().split('T')[0];
      timelineByDay[day] = (timelineByDay[day] || 0) + 1;
    });

    return NextResponse.json({
      link: {
        ...link,
        creator: creator
          ? { id: creator.id, email: creator.email, full_name: creator.full_name, created_at: creator.created_at }
          : null,
        workspace: workspace
          ? { id: workspace.id, name: workspace.name, slug: workspace.slug }
          : null,
        status,
        today_clicks: todayClicks || 0,
        last_click_at: lastClick?.created_at || null,
        has_password: !!link.password_hash,
      },
      analytics: {
        device: aggregate(deviceBreakdown, 'device'),
        browser: aggregate(browserBreakdown, 'browser'),
        os: aggregate(osBreakdown, 'os'),
        country: aggregate(countryBreakdown, 'country'),
        city: aggregate(cityBreakdown, 'city'),
        referer: aggregate(refererBreakdown, 'referer'),
        timeline: Object.entries(timelineByDay).map(([date, clicks]) => ({ date, clicks })),
        recent_clicks: recentClicks || [],
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
