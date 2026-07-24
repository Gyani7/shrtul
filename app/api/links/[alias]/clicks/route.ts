import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, createServerClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { alias: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const { data: link } = await supabaseServer()
      .from('links')
      .select('id, workspace_id, is_guest, creator_id')
      .eq('alias', params.alias)
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (token) {
      const client = createServerClient(token);
      const { data: { user }, error: authError } = await client.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      if (link.creator_id !== user.id) {
        const { data: profile } = await client
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        if (!profile?.is_admin) {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }
      }

      const { data: clicks, error } = await client
        .from('clicks')
        .select('*')
        .eq('link_id', link.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ clicks, link });
    }

    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
