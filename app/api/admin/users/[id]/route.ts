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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user, isAdmin } = await checkAdmin();
    if (!isAdmin || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const { action, reason } = body;

    if (action === 'ban') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_banned: true, ban_reason: reason || 'Violation of terms' })
        .eq('id', params.id);
      if (profileError) throw profileError;

      const { error: banError } = await supabase.from('banned_users').insert({
        user_id: params.id,
        reason: reason || 'Violation of terms',
        banned_by: user.id,
        banned_at: new Date().toISOString(),
      });
      if (banError) console.error('Failed to log ban:', banError.message);

      return NextResponse.json({ success: true, action: 'banned' });
    }

    if (action === 'unban') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_banned: false, ban_reason: null })
        .eq('id', params.id);
      if (profileError) throw profileError;

      const { error: unbanError } = await supabase
        .from('banned_users')
        .update({ unbanned_at: new Date().toISOString() })
        .eq('user_id', params.id)
        .is('unbanned_at', null);
      if (unbanError) console.error('Failed to log unban:', unbanError.message);

      return NextResponse.json({ success: true, action: 'unbanned' });
    }

    if (action === 'make_admin') {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', params.id);
      if (error) throw error;
      return NextResponse.json({ success: true, action: 'made_admin' });
    }

    if (action === 'remove_admin') {
      if (params.id === user.id) {
        return NextResponse.json({ error: 'Cannot remove your own admin status' }, { status: 400 });
      }
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', params.id);
      if (error) throw error;
      return NextResponse.json({ success: true, action: 'removed_admin' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
