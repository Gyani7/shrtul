import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from './supabase-server';

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) _admin = supabaseServer();
  return _admin;
}
