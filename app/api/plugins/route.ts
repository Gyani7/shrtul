import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase-server';
import { getWorkspacePlugins, installPlugin, updatePlugin, uninstallPlugin } from '@/engines/plugin/queries';
import { listPluginManifests, getPluginManifest } from '@/engines/plugin/registry';
import type { CreatePluginInput } from '@/engines/plugin/types';

export async function GET(req: NextRequest) {
  const { client, user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get('workspace_id');

  if (!workspaceId) {
    return NextResponse.json({ plugins: listPluginManifests() });
  }

  try {
    const plugins = await getWorkspacePlugins(workspaceId);
    return NextResponse.json({ plugins });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { client, user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { workspace_id, plugin_key, name, config } = body;

    if (!workspace_id || !plugin_key) {
      return NextResponse.json({ error: 'workspace_id and plugin_key required' }, { status: 400 });
    }

    const manifest = getPluginManifest(plugin_key);
    if (!manifest) {
      return NextResponse.json({ error: 'Unknown plugin' }, { status: 400 });
    }

    const input: CreatePluginInput = {
      workspace_id,
      plugin_key,
      name: name || manifest.name,
      version: manifest.version,
      config: config || {},
    };

    const plugin = await installPlugin(input);
    return NextResponse.json({ plugin });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { client, user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, config, is_enabled, name } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (config !== undefined) updates.config = config;
    if (is_enabled !== undefined) updates.is_enabled = is_enabled;
    if (name !== undefined) updates.name = name;

    const plugin = await updatePlugin(id, updates);
    return NextResponse.json({ plugin });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { client, user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await uninstallPlugin(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
