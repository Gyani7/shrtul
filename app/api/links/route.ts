import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, createServerClient } from '@/lib/supabase';
import { generateShortCode, isValidUrl, normalizeUrl, isSafeUrl } from '@/lib/shortener';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, alias, title, workspace_id, is_guest, guest_session_id } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized) || !isSafeUrl(normalized)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const finalAlias = (alias && alias.trim()) || generateShortCode();

    if (is_guest) {
      if (!guest_session_id) {
        return NextResponse.json({ error: 'Session ID required for guest links' }, { status: 400 });
      }

      const { data, error } = await supabaseServer()
        .from('links')
        .insert({
          original_url: normalized,
          alias: finalAlias,
          title: title || '',
          is_active: true,
          is_guest: true,
          guest_session_id,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          workspace_id: null,
          creator_id: null,
        })
        .select('alias, original_url, expires_at, is_guest, guest_session_id')
        .single();

      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          return NextResponse.json({ error: 'Alias already taken' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const origin = req.nextUrl.origin;
      return NextResponse.json({
        ...data,
        short_url: `${origin}/${data.alias}`,
      });
    }

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

    let wsId = workspace_id;
    if (!wsId) {
      const { data: wsData } = await client
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);
      wsId = wsData?.[0]?.id;

      if (!wsId) {
        const { data: memberWs } = await client
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1);
        wsId = memberWs?.[0]?.workspace_id;
      }
    }

    if (!wsId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    const { data, error } = await client
      .from('links')
      .insert({
        original_url: normalized,
        alias: finalAlias,
        title: title || '',
        workspace_id: wsId,
        creator_id: user.id,
        is_active: true,
        is_guest: false,
      })
      .select('alias, original_url, expires_at, is_guest, guest_session_id')
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        return NextResponse.json({ error: 'Alias already taken' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const origin = req.nextUrl.origin;
    return NextResponse.json({
      ...data,
      short_url: `${origin}/${data.alias}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    const { data: wsData } = await client
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    let wsId = wsData?.[0]?.id;

    if (!wsId) {
      const { data: memberWs } = await client
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1);
      wsId = memberWs?.[0]?.workspace_id;
    }

    if (!wsId) {
      return NextResponse.json({ links: [] });
    }

    const { data: links, error } = await client
      .from('links')
      .select('*')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ links });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
