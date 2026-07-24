import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, createServerClient } from '@/lib/supabase';
import { isValidUrl, normalizeUrl, isSafeUrl } from '@/lib/shortener';

export async function GET(
  _req: NextRequest,
  { params }: { params: { alias: string } }
) {
  try {
    const { data: link, error } = await supabaseServer()
      .from('links')
      .select(
        'alias, original_url, title, total_clicks, is_active, created_at, expires_at, is_guest, password_hash'
      )
      .eq('alias', params.alias)
      .maybeSingle();

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { alias: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const client = createServerClient(token);
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: link } = await client
      .from('links')
      .select('id, creator_id, workspace_id')
      .eq('alias', params.alias)
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
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
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;
    if (body.utm_source !== undefined) updateData.utm_source = body.utm_source;
    if (body.utm_medium !== undefined) updateData.utm_medium = body.utm_medium;
    if (body.utm_campaign !== undefined) updateData.utm_campaign = body.utm_campaign;
    if (body.utm_term !== undefined) updateData.utm_term = body.utm_term;
    if (body.utm_content !== undefined) updateData.utm_content = body.utm_content;
    if (body.qr_svg !== undefined) updateData.qr_svg = body.qr_svg;

    if (body.original_url !== undefined) {
      const normalized = normalizeUrl(body.original_url);
      if (!isValidUrl(normalized) || !isSafeUrl(normalized)) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
      }
      updateData.original_url = normalized;
    }

    if (body.password !== undefined) {
      if (body.password === '') {
        updateData.password_hash = null;
      } else {
        const { data: hash } = await client
          .rpc('hash_password', { pw: body.password });
        updateData.password_hash = hash;
      }
    }

    const { data: updated, error } = await client
      .from('links')
      .update(updateData)
      .eq('id', link.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { alias: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const client = createServerClient(token);
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: link } = await client
      .from('links')
      .select('id, creator_id')
      .eq('alias', params.alias)
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (link.creator_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error } = await client.from('links').delete().eq('id', link.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
