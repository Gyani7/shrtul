import { createAuthenticatedClient } from './supabase-server';

export async function checkAdminAuth() {
  const { client, user, error } = await createAuthenticatedClient();
  if (error || !user) {
    return { authorized: false, user: null, client, error: 'Unauthorized' };
  }

  const { data: profile } = await client
    .from('profiles')
    .select('is_admin, is_banned')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.is_banned) {
    return { authorized: false, user: null, client, error: 'Forbidden' };
  }

  if (!profile.is_admin) {
    return { authorized: false, user: null, client, error: 'Admin access required' };
  }

  return { authorized: true, user, client, error: null };
}
