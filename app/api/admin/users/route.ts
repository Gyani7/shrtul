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

    let query = supabase.from('profiles').select('id, email, full_name, is_admin, is_banned, created_at', { count: 'exact' });
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ users, total: count || 0, page, limit });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
