import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, createServerClient } from "@/lib/supabase-server";
import { generateShortCode, isValidUrl, normalizeUrl, isSafeUrl, isValidAlias } from '@/lib/shortener';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, alias, title, workspace_id, is_guest, guest_session_id, password, expires_at } = body;

    // Validate URL — this becomes destination_url in the database (NOT NULL column)
    if (!url || typeof url !== 'string' || !url.trim()) {
      console.warn('[links-api] rejected: url missing or empty', { urlType: typeof url });
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalized = normalizeUrl(url);
    if (!normalized || !isValidUrl(normalized) || !isSafeUrl(normalized)) {
      console.warn('[links-api] rejected: invalid url after normalize', { original: url, normalized });
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Final guard: ensure destination_url is never null or empty before insert
    if (!normalized.trim()) {
      console.error('[links-api] CRITICAL: normalized url is empty after validation', { url });
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const finalAlias = (alias && typeof alias === 'string' && alias.trim()) || generateShortCode();

    if (!isValidAlias(finalAlias)) {
      return NextResponse.json({ error: 'Alias must be 3-32 chars: letters, numbers, hyphens, underscores' }, { status: 400 });
    }

    if (is_guest) {
      if (!guest_session_id) {
        return NextResponse.json({ error: 'Session ID required for guest links' }, { status: 400 });
      }

      const insertPayload: Record<string, unknown> = {
        destination_url: normalized,
        alias: finalAlias,
        title: title || '',
        is_active: true,
        is_guest: true,
        guest_session_id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        workspace_id: null,
        creator_id: null,
      };

      console.log('[links-api] guest insert:', { alias: finalAlias, destination_url_length: normalized.length, destination_url_preview: normalized.substring(0, 60) });

      const { data, error } = await supabaseServer()
        .from('links')
        .insert(insertPayload)
        .select('alias, destination_url, expires_at, is_guest, guest_session_id')
        .single();

      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          return NextResponse.json({ error: 'Alias already taken' }, { status: 409 });
        }
        console.error('[links-api] guest insert failed:', error.message, { alias: finalAlias });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const origin = req.nextUrl.origin;
      return NextResponse.json({
        ...data,
        short_url: `${origin}/${data.alias}`,
      });
    }

    // Authenticated path
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
      const { data: newWsId, error: wsError } = await client
        .rpc('ensure_user_workspace');
      if (wsError || !newWsId) {
        return NextResponse.json({ error: 'Failed to create workspace: ' + (wsError?.message || 'unknown') }, { status: 500 });
      }
      wsId = newWsId;
    }

    const insertPayload: Record<string, unknown> = {
      destination_url: normalized,
      alias: finalAlias,
      title: title || '',
      workspace_id: wsId,
      creator_id: user.id,
      is_active: true,
      is_guest: false,
    };

    // Handle password protection — hash via database function
    if (password && typeof password === 'string' && password.trim()) {
      const { data: hashData, error: hashError } = await client
        .rpc('hash_password', { pw: password });
      if (hashError) {
        console.error('[links-api] password hash failed:', hashError.message);
        return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
      }
      insertPayload.password_hash = hashData;
    }

    // Handle expiry date for authenticated users
    if (expires_at && typeof expires_at === 'string') {
      const expiryDate = new Date(expires_at);
      if (!isNaN(expiryDate.getTime())) {
        insertPayload.expires_at = expiryDate.toISOString();
      }
    }

    // Final guard: verify destination_url is present and non-empty
    if (!insertPayload.destination_url || typeof insertPayload.destination_url !== 'string' || !insertPayload.destination_url.trim()) {
      console.error('[links-api] CRITICAL: destination_url is null/empty before insert', { url, normalized, alias: finalAlias });
      return NextResponse.json({ error: 'Failed to create link: destination URL is missing' }, { status: 500 });
    }

    console.log('[links-api] auth insert:', { alias: finalAlias, destination_url_length: (insertPayload.destination_url as string).length, destination_url_preview: (insertPayload.destination_url as string).substring(0, 60), has_password: !!insertPayload.password_hash, has_expiry: !!insertPayload.expires_at });

    const { data, error } = await client
      .from('links')
      .insert(insertPayload)
      .select('alias, destination_url, expires_at, is_guest, guest_session_id')
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        return NextResponse.json({ error: 'Alias already taken' }, { status: 409 });
      }
      console.error('[links-api] auth insert failed:', error.message, { alias: finalAlias, code: error.code });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const origin = req.nextUrl.origin;
    return NextResponse.json({
      ...data,
      short_url: `${origin}/${data.alias}`,
    });
  } catch (err) {
    console.error('[links-api] unhandled error:', err instanceof Error ? err.message : String(err));
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
