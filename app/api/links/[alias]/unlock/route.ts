import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: { alias: string } }
) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const { data: link } = await supabaseServer()
      .from('links')
      .select('id, destination_url, password_hash, total_clicks, workspace_id, is_active')
      .eq('alias', params.alias)
      .maybeSingle();

    if (!link || !link.is_active) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (!link.password_hash) {
      return NextResponse.json({ error: 'Link is not password-protected' }, { status: 400 });
    }

    const { data: isValid, error: verifyError } = await supabaseServer()
      .rpc('verify_password', { pw: password, hash: link.password_hash });

    if (verifyError || !isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    const headersList = headers();
    const ua = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || null;
    const forwarded = headersList.get('x-forwarded-for') || '';
    const ip = forwarded.split(',')[0].trim() || null;

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'desktop';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome|crios|crmo/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac os|macintosh/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';
    if (/mobile|android|iphone/i.test(ua)) device = 'mobile';
    else if (/ipad|tablet/i.test(ua)) device = 'tablet';

    await supabaseServer().from('clicks').insert({
      link_id: link.id,
      workspace_id: link.workspace_id,
      visitor_ip: ip,
      referer,
      browser,
      os,
      device,
    });

    return NextResponse.json({ url: link.destination_url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
