import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  try {
    const supabase = createRouteClient();
    const { data: link } = await supabase
      .from('links')
      .select('id, alias, is_active, expires_at, password_hash')
      .eq('alias', params.shortcode)
      .maybeSingle();

    if (!link || !link.is_active) {
      return NextResponse.redirect(new URL('/link-not-found', req.url));
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/expired', req.url));
    }

    return NextResponse.json({
      alias: link.alias,
      hasPassword: !!link.password_hash,
    });
  } catch {
    return NextResponse.redirect(new URL('/link-not-found', req.url));
  }
}
