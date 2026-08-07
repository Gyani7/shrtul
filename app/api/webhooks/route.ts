import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase-server';
import {
  getWorkspaceWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookDeliveries,
} from '@/engines/webhook/dispatch';
import type { CreateWebhookInput } from '@/engines/webhook/types';

export async function GET(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get('workspace_id');
  const webhookId = url.searchParams.get('webhook_id');

  if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });

  try {
    if (webhookId) {
      const deliveries = await getWebhookDeliveries(webhookId);
      return NextResponse.json({ deliveries });
    }

    const webhooks = await getWorkspaceWebhooks(workspaceId);
    return NextResponse.json({ webhooks });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { workspace_id, url: webhookUrl, events, secret, is_active } = body;

    if (!workspace_id || !webhookUrl || !events?.length) {
      return NextResponse.json({ error: 'workspace_id, url, and events required' }, { status: 400 });
    }

    const input: CreateWebhookInput = {
      workspace_id,
      url: webhookUrl,
      events,
      secret,
      is_active,
    };

    const webhook = await createWebhook(input);
    return NextResponse.json({ webhook });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, url: webhookUrl, events, is_active, secret } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (webhookUrl !== undefined) updates.url = webhookUrl;
    if (events !== undefined) updates.events = events;
    if (is_active !== undefined) updates.is_active = is_active;
    if (secret !== undefined) updates.secret = secret;

    const webhook = await updateWebhook(id, updates);
    return NextResponse.json({ webhook });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await deleteWebhook(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
