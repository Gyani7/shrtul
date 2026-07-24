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
 * Returns a Supabase client authenticated with the current user's session token,
 * plus the user object. In Server Components, cookies are read-only so session
 * refresh tokens cannot be persisted. This helper calls getUser() (which refreshes
 * the session in-memory), then extracts the access token from getSession() and
 * creates a client that passes it in the Authorization header — ensuring DB queries
 * are authenticated even when the cookie-based token is stale.
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
    console.error('[auth] getUser failed:', userError?.message ?? 'no user');
    return { client: cookieClient, user: null, error: userError?.message ?? 'no user' };
  }

  const { data: sessionData } = await cookieClient.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    console.error('[auth] getSession returned no access token for user:', user.id);
    return { client: cookieClient, user: null, error: 'no access token in session' };
  }

  const client = createServerClient(accessToken);
  return { client, user: { id: user.id, email: user.email || '' }, error: null };
}
