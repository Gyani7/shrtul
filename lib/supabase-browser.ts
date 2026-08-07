import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient<any, any> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

let _client: SupabaseClient<any, any> | null = null;

export const supabase = new Proxy({} as SupabaseClient<any, any>, {
  get(_target, prop, receiver) {
    if (!_client) _client = createClient();
    return Reflect.get(_client, prop, receiver);
  },
});
