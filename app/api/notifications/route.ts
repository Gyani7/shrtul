import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase-server';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getOrCreatePreferences,
  updatePreferences,
} from '@/engines/notification/dispatch';

export async function GET(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'unread_count') {
      const count = await getUnreadCount(user.id);
      return NextResponse.json({ count });
    }

    if (action === 'preferences') {
      const prefs = await getOrCreatePreferences(user.id);
      return NextResponse.json({ preferences: prefs });
    }

    const notifications = await getUserNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action, id, preferences } = body;

    if (action === 'mark_all_read') {
      await markAllAsRead(user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_preferences' && preferences) {
      const prefs = await updatePreferences(user.id, preferences);
      return NextResponse.json({ preferences: prefs });
    }

    if (id) {
      await markAsRead(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
    await deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
