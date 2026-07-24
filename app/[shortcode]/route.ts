import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

function parseUserAgent(ua: string) {
  const browser = /Edg\//i.test(ua) ? 'Edge' : /Chrome\//i.test(ua) ? 'Chrome' : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : /OPR\//i.test(ua) ? 'Opera' : 'Other';
  const os = /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
  const device = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Desktop';
  return { browser, os, device };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  try {
    const supabase = createRouteClient();
    const { data: link, error } = await supabase
      .from('links')
      .select('id, original_url, alias, is_active, expires_at, password_hash, workspace_id, is_guest, total_clicks')
      .eq('alias', params.shortcode)
      .maybeSingle();

    if (error || !link) {
      return NextResponse.redirect(new URL('/link-not-found', req.url));
    }

    if (!link.is_active) {
      return NextResponse.redirect(new URL('/gone', req.url));
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/expired', req.url));
    }

    if (link.password_hash) {
      const unlockUrl = new URL(`/unlock/${link.alias}`, req.url);
      return NextResponse.redirect(unlockUrl);
    }

    const { data: settings } = await supabase
      .from('platform_settings')
      .select('redirect_percentage, promo_enabled')
      .eq('id', 1)
      .single();

    let isPromoRedirect = false;
    let promoUrlId: string | null = null;
    let finalUrl = link.original_url;

    if (settings?.promo_enabled && Number(settings.redirect_percentage) > 0) {
      const pct = Number(settings.redirect_percentage);
      if (Math.random() < pct) {
        const { data: promoUrls } = await supabase
          .from('promo_urls')
          .select('id, url, weight')
          .eq('is_active', true)
          .order('weight', { ascending: false });

        if (promoUrls && promoUrls.length > 0) {
          const totalWeight = promoUrls.reduce((sum, p) => sum + p.weight, 0);
          let random = Math.random() * totalWeight;
          let selected = promoUrls[0];
          for (const p of promoUrls) {
            random -= p.weight;
            if (random <= 0) {
              selected = p;
              break;
            }
          }
          isPromoRedirect = true;
          promoUrlId = selected.id;
        }
      }
    }

    const ua = req.headers.get('user-agent') || '';
    const { browser, os, device } = parseUserAgent(ua);
    const referer = req.headers.get('referer') || null;
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || req.headers.get('x-country') || null;
    const city = req.headers.get('x-vercel-ip-city') || null;
    const region = req.headers.get('x-vercel-ip-country-region') || null;
    const visitorIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    await supabase.from('clicks').insert({
      link_id: link.id,
      workspace_id: link.workspace_id,
      visitor_ip: visitorIp,
      country,
      city,
      region,
      browser,
      device,
      os,
      referer,
      is_promo_redirect: isPromoRedirect,
      promo_url_id: promoUrlId,
    });

    await supabase.rpc('increment_link_counters', {
      link_id_input: link.id,
      is_promo: isPromoRedirect,
    });

    if (isPromoRedirect && promoUrlId) {
      await supabase.rpc('increment_promo_sends', { promo_id: promoUrlId });

      const { data: promoUrl } = await supabase
        .from('promo_urls')
        .select('url')
        .eq('id', promoUrlId)
        .single();

      if (promoUrl?.url) {
        const promoRedirect = new URL(promoUrl.url);
        promoRedirect.searchParams.set('url', link.original_url);
        finalUrl = promoRedirect.toString();
      }
    }

    return NextResponse.redirect(finalUrl, { status: 302 });
  } catch {
    return NextResponse.redirect(new URL('/link-not-found', req.url));
  }
}
