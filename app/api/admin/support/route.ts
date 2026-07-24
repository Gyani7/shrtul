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
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ tickets: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, user, isAdmin } = await checkAdmin();
    if (!isAdmin || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const { id, admin_reply, status } = body;

    const updateData: Record<string, unknown> = {};
    if (admin_reply !== undefined) {
      updateData.admin_reply = admin_reply;
      updateData.replied_at = new Date().toISOString();
      if (!status) updateData.status = 'resolved';
    }
    if (status) updateData.status = status;

    const { error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
