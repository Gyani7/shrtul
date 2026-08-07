import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

async function checkAdmin() {
  const supabase = createRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_banned')
    .eq('id', user.id)
    .maybeSingle();
  return { supabase, user, isAdmin: !!profile?.is_admin && !profile?.is_banned };
}

export async function GET() {
  try {
    const { supabase, isAdmin } = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    const { data: promoUrls } = await supabase
      .from('promo_urls')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ settings: data, promoUrls: promoUrls || [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, isAdmin } = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const { settings, promoUrls } = body;

    if (settings) {
      const updateData: Record<string, unknown> = {};
      if (settings.redirect_percentage !== undefined) {
        const pct = Math.min(Math.max(Number(settings.redirect_percentage), 0), settings.max_redirect_percentage || 100);
        updateData.redirect_percentage = pct;
      }
      if (settings.promo_enabled !== undefined) updateData.promo_enabled = settings.promo_enabled;
      if (settings.maintenance_mode !== undefined) updateData.maintenance_mode = settings.maintenance_mode;
      if (settings.maintenance_message !== undefined) updateData.maintenance_message = settings.maintenance_message;
      if (settings.site_name !== undefined) updateData.site_name = settings.site_name;
      if (settings.site_description !== undefined) updateData.site_description = settings.site_description;
      if (settings.seo_keywords !== undefined) updateData.seo_keywords = settings.seo_keywords;
      if (settings.signup_bonus_clicks !== undefined) updateData.signup_bonus_clicks = settings.signup_bonus_clicks;
      if (settings.donation_url !== undefined) updateData.donation_url = settings.donation_url;
      if (settings.coffee_url !== undefined) updateData.coffee_url = settings.coffee_url;
      if (settings.max_redirect_percentage !== undefined) updateData.max_redirect_percentage = settings.max_redirect_percentage;

      const { error } = await supabase
        .from('platform_settings')
        .update(updateData)
        .eq('id', 1);
      if (error) throw error;
    }

    if (promoUrls) {
      for (const promo of promoUrls) {
        if (promo._action === 'delete') {
          await supabase.from('promo_urls').delete().eq('id', promo.id);
        } else if (promo._action === 'create') {
          await supabase.from('promo_urls').insert({
            url: promo.url,
            name: promo.name,
            description: promo.description || '',
            weight: promo.weight || 1,
            is_active: promo.is_active ?? true,
          });
        } else if (promo._action === 'update') {
          await supabase.from('promo_urls').update({
            url: promo.url,
            name: promo.name,
            description: promo.description || '',
            weight: promo.weight || 1,
            is_active: promo.is_active,
          }).eq('id', promo.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
