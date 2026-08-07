import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _server: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_server) return _server;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
  _server = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _server;
}

export function createServerClient(token?: string) {
  if (token) {
    return createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }
  const cookieStore = cookies();
  return createSSRClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as never)
          );
        } catch {
          // Called from a Server Component — safe to ignore
        }
      },
    },
  });
}

export function createRouteClient() {
  const cookieStore = cookies();
  return createSSRClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options as never)
        );
      },
    },
  });
}

/**
 * Returns a Supabase client for use in Server Components, plus the user object.
 *
 * Uses getUser() (which validates the JWT against the Supabase auth server) to
 * determine the current user. Data queries use the service role client so RLS
 * doesn't block reads when the cookie-based access token is stale or expired.
 * The middleware handles token refresh and cookie updates on every request.
 */
export async function createAuthenticatedClient(): Promise<{
  client: SupabaseClient;
  user: { id: string; email: string } | null;
  error: string | null;
}> {
  const cookieClient = createServerClient();
  const {
    data: { user },
    error: userError,
  } = await cookieClient.auth.getUser();

  if (userError || !user) {
    return { client: getSupabaseAdmin(), user: null, error: userError?.message ?? 'no user' };
  }

  return {
    client: getSupabaseAdmin(),
    user: { id: user.id, email: user.email || '' },
    error: null,
  };
}

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    _admin = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_admin) _admin = getSupabaseAdmin();
    return Reflect.get(_admin, prop, receiver);
  },
});
