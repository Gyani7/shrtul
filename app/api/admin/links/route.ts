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

export async function GET(req: NextRequest) {
  try {
    const { supabase, isAdmin } = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase.from('links').select('id, alias, original_url, title, total_clicks, is_active, is_guest, created_at, creator_id', { count: 'exact' });
    if (search) {
      query = query.or(`alias.ilike.%${search}%,original_url.ilike.%${search}%,title.ilike.%${search}%`);
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: links, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ links, total: count || 0, page, limit });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, isAdmin } = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('id');

    if (!linkId) return NextResponse.json({ error: 'Link ID required' }, { status: 400 });

    const { error } = await supabase.from('links').delete().eq('id', linkId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
