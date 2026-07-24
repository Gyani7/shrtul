import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const body = await req.json();

    if (body.action === 'feature') {
      const { error } = await supabaseAdmin
        .from('links')
        .update({ is_featured: true })
        .eq('id', params.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const { error: featuredError } = await supabaseAdmin.from('featured_links').insert({
        link_id: params.id,
        reason: body.reason || 'Featured by admin',
        featured_by: auth.user?.id,
      });
      if (featuredError) return NextResponse.json({ error: featuredError.message }, { status: 500 });

      return NextResponse.json({ success: true });
    }

    if (body.action === 'unfeature') {
      const { error } = await supabaseAdmin
        .from('links')
        .update({ is_featured: false })
        .eq('id', params.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const { error: deleteError } = await supabaseAdmin.from('featured_links').delete().eq('link_id', params.id);
      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

      return NextResponse.json({ success: true });
    }

    if (body.action === 'toggle_active') {
      const { data: link } = await supabaseAdmin
        .from('links')
        .select('is_active')
        .eq('id', params.id)
        .maybeSingle();

      const { error } = await supabaseAdmin
        .from('links')
        .update({ is_active: !link?.is_active })
        .eq('id', params.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true });
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
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const { error } = await supabaseAdmin
      .from('links')
      .delete()
      .eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
