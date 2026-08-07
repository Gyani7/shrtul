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

    const { data: profile, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Get link stats
    const { data: links } = await admin
      .from('links')
      .select('id, alias, destination_url, is_active, is_guest, expires_at, total_clicks, created_at')
      .eq('creator_id', params.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const activeLinks = links?.filter((l) => l.is_active && (!l.expires_at || new Date(l.expires_at).getTime() > Date.now())).length || 0;
    const expiredLinks = links?.filter((l) => l.expires_at && new Date(l.expires_at).getTime() < Date.now()).length || 0;
    const totalClicks = links?.reduce((sum, l) => sum + (l.total_clicks || 0), 0) || 0;

    return NextResponse.json({
      user: profile,
      stats: {
        total_links: links?.length || 0,
        active_links: activeLinks,
        expired_links: expiredLinks,
        total_clicks: totalClicks,
      },
      links: links || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, user } = await checkAdmin();
    if (!authorized || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const admin = getSupabaseAdmin();
    const body = await req.json();
    const { action, reason } = body;

    if (action === 'ban') {
      const { error: profileError } = await admin
        .from('profiles')
        .update({ is_banned: true, ban_reason: reason || 'Violation of terms' })
        .eq('id', params.id);
      if (profileError) throw profileError;

      const { error: banError } = await admin.from('banned_users').insert({
        user_id: params.id,
        reason: reason || 'Violation of terms',
        banned_by: user.id,
        banned_at: new Date().toISOString(),
      });
      if (banError) console.error('Failed to log ban:', banError.message);

      return NextResponse.json({ success: true, action: 'banned' });
    }

    if (action === 'unban') {
      const { error: profileError } = await admin
        .from('profiles')
        .update({ is_banned: false, ban_reason: null })
        .eq('id', params.id);
      if (profileError) throw profileError;

      const { error: unbanError } = await admin
        .from('banned_users')
        .update({ unbanned_at: new Date().toISOString() })
        .eq('user_id', params.id)
        .is('unbanned_at', null);
      if (unbanError) console.error('Failed to log unban:', unbanError.message);

      return NextResponse.json({ success: true, action: 'unbanned' });
    }

    if (action === 'make_admin') {
      const { error } = await admin
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
      const { error } = await admin
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', params.id);
      if (error) throw error;
      return NextResponse.json({ success: true, action: 'removed_admin' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, user } = await checkAdmin();
    if (!authorized || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    if (params.id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Delete user's links first (cascades to clicks if FK is set up, otherwise explicit)
    await admin.from('clicks').delete().in('link_id', (
      await admin.from('links').select('id').eq('creator_id', params.id)
    ).data?.map((l) => l.id) || []);

    await admin.from('links').delete().eq('creator_id', params.id);
    await admin.from('banned_users').delete().eq('user_id', params.id);
    await admin.from('profiles').delete().eq('id', params.id);

    // Delete the auth user
    const { error: authError } = await admin.auth.admin.deleteUser(params.id);
    if (authError) console.error('Failed to delete auth user:', authError.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
