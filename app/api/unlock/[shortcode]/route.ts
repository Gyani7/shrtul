import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { isSafeUrl } from '@/lib/shortener';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  try {
    const { shortcode } = await params;
    const { password } = await req.json();

    if (typeof password !== 'string' || password.length > 1000) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data: link, error } = await supabase
      .from('links')
      .select('id, original_url, alias, is_active, expires_at, password_hash, workspace_id')
      .eq('alias', shortcode)
      .maybeSingle();

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (!link.is_active) {
      return NextResponse.json({ error: 'Link is inactive' }, { status: 410 });
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 410 });
    }

    if (link.password_hash) {
      const { data: verified, error: verifyError } = await supabase.rpc('verify_password', {
        pw: password,
        hash: link.password_hash,
      });

      if (verifyError || !verified) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
      }
    }

    if (!isSafeUrl(link.original_url)) {
      return NextResponse.json({ error: 'Invalid destination URL' }, { status: 400 });
    }

    const ua = req.headers.get('user-agent') || '';
    const browser = /Edg\//i.test(ua) ? 'Edge' : /Chrome\//i.test(ua) ? 'Chrome' : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : 'Other';
    const os = /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
    const device = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Desktop';
    const referer = req.headers.get('referer') || null;
    const country = req.headers.get('x-vercel-ip-country') || null;
    const city = req.headers.get('x-vercel-ip-city') || null;
    const visitorIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    await supabase.from('clicks').insert({
      link_id: link.id,
      workspace_id: link.workspace_id,
      visitor_ip: visitorIp,
      country,
      city,
      browser,
      device,
      os,
      referer,
      is_promo_redirect: false,
    });

    await supabase.rpc('increment_link_counters', {
      link_id_input: link.id,
      is_promo: false,
    });

    return NextResponse.json({ url: link.original_url });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
