export { supabaseServer, createServerClient, createRouteClient, createAuthenticatedClient } from './supabase-server';

import type { SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const { supabaseServer } = require('./supabase-server');
    _admin = supabaseServer();
  }
  return _admin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_admin) {
      const { supabaseServer } = require('./supabase-server');
      _admin = supabaseServer();
    }
    return Reflect.get(_admin, prop, receiver);
  },
});
