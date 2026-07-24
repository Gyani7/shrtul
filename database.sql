-- ============================================================================
-- database.sql — Production-ready schema for Shrtul (URL Shortener SaaS)
-- Project: uwqlzgobsesnrckisaoh
-- Generated: 2026-07-22
--
-- INSTRUCTIONS:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Select your production project (uwqlzgobsesnrckisaoh)
--   3. Paste this entire file and click Run
--   4. All statements are idempotent (safe to re-run)
-- ============================================================================

-- ============ EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============ TABLES ============

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL DEFAULT '',
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text
);

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS promo_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  weight integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  total_sends bigint NOT NULL DEFAULT 0,
  revenue_per_send numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  redirect_percentage numeric NOT NULL DEFAULT 0.20 CHECK (redirect_percentage >= 0 AND redirect_percentage <= 1),
  promo_enabled boolean NOT NULL DEFAULT true,
  signup_bonus_clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blacklisted_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_id uuid DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  original_url text NOT NULL,
  alias text UNIQUE NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  password_hash text,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  geo_targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  device_targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  qr_svg text,
  total_clicks bigint NOT NULL DEFAULT 0,
  promo_clicks bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_guest boolean NOT NULL DEFAULT false,
  guest_session_id text,
  is_featured boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  visitor_ip inet,
  country text,
  city text,
  region text,
  browser text,
  device text,
  os text,
  referer text,
  is_promo_redirect boolean NOT NULL DEFAULT false,
  promo_url_id uuid REFERENCES promo_urls(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  is_unique boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS abuse_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  link_id uuid REFERENCES links(id) ON DELETE SET NULL,
  reason text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  is_verified boolean NOT NULL DEFAULT false,
  is_primary boolean NOT NULL DEFAULT false,
  verification_token text,
  ssl_status text NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending','active','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_active boolean NOT NULL DEFAULT true,
  is_dismissible boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT 'Violation of terms',
  banned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  banned_at timestamptz NOT NULL DEFAULT now(),
  unbanned_at timestamptz
);

CREATE TABLE IF NOT EXISTS featured_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  featured_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL DEFAULT 'Abuse',
  blocked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deploy_keys (
  id text PRIMARY KEY DEFAULT 'default',
  private_key text NOT NULL,
  public_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ ENABLE RLS ON ALL TABLES ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklisted_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER FUNCTIONS ============

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true AND is_banned = false
  );
$$;

-- ============ PROFILES POLICIES ============
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============ WORKSPACES POLICIES ============
DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;
CREATE POLICY "workspaces_select_member" ON workspaces FOR SELECT
  TO authenticated USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "workspaces_insert_own" ON workspaces;
CREATE POLICY "workspaces_insert_own" ON workspaces FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_insert_member" ON workspaces;
CREATE POLICY "workspaces_insert_member" ON workspaces FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_update_own" ON workspaces;
CREATE POLICY "workspaces_update_own" ON workspaces FOR UPDATE
  TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_update_member" ON workspaces;
CREATE POLICY "workspaces_update_member" ON workspaces FOR UPDATE
  TO authenticated USING (
    owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
    )
  ) WITH CHECK (
    owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "workspaces_delete_own" ON workspaces;
CREATE POLICY "workspaces_delete_own" ON workspaces FOR DELETE
  TO authenticated USING (owner_id = auth.uid());

-- ============ WORKSPACE_MEMBERS POLICIES ============
DROP POLICY IF EXISTS "wm_select_member" ON workspace_members;
CREATE POLICY "wm_select_member" ON workspace_members FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspace_members m WHERE m.workspace_id = workspace_members.workspace_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "wm_insert_owner" ON workspace_members;
CREATE POLICY "wm_insert_owner" ON workspace_members
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "wm_update_owner" ON workspace_members;
CREATE POLICY "wm_update_owner" ON workspace_members
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "wm_delete_owner" ON workspace_members;
CREATE POLICY "wm_delete_owner" ON workspace_members
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

-- ============ PROMO_URLS POLICIES ============
DROP POLICY IF EXISTS "promo_select_public" ON promo_urls;
CREATE POLICY "promo_select_public" ON promo_urls FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "promo_urls_select_member" ON promo_urls;
CREATE POLICY "promo_urls_select_member" ON promo_urls FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "promo_insert_admin" ON promo_urls;
CREATE POLICY "promo_insert_admin" ON promo_urls
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "promo_update_admin" ON promo_urls;
CREATE POLICY "promo_update_admin" ON promo_urls
  FOR UPDATE TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "promo_delete_admin" ON promo_urls;
CREATE POLICY "promo_delete_admin" ON promo_urls
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- ============ PLATFORM_SETTINGS POLICIES ============
DROP POLICY IF EXISTS "settings_select_public" ON platform_settings;
CREATE POLICY "settings_select_public" ON platform_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "platform_settings_select_member" ON platform_settings;
CREATE POLICY "platform_settings_select_member" ON platform_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_admin" ON platform_settings;
CREATE POLICY "settings_update_admin" ON platform_settings
  FOR UPDATE TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "platform_settings_insert_admin" ON platform_settings;
CREATE POLICY "platform_settings_insert_admin" ON platform_settings
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "platform_settings_update_admin" ON platform_settings;
CREATE POLICY "platform_settings_update_admin" ON platform_settings
  FOR UPDATE TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "platform_settings_delete_admin" ON platform_settings;
CREATE POLICY "platform_settings_delete_admin" ON platform_settings
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- ============ BLACKLISTED_DOMAINS POLICIES ============
DROP POLICY IF EXISTS "blacklist_select_public" ON blacklisted_domains;
CREATE POLICY "blacklist_select_public" ON blacklisted_domains FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blacklisted_domains_select_member" ON blacklisted_domains;
CREATE POLICY "blacklisted_domains_select_member" ON blacklisted_domains FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "blacklist_insert_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_insert_admin" ON blacklisted_domains
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "blacklisted_domains_insert_admin" ON blacklisted_domains;
CREATE POLICY "blacklisted_domains_insert_admin" ON blacklisted_domains
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "blacklisted_domains_update_admin" ON blacklisted_domains;
CREATE POLICY "blacklisted_domains_update_admin" ON blacklisted_domains
  FOR UPDATE TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "blacklist_delete_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_delete_admin" ON blacklisted_domains
  FOR DELETE TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "blacklisted_domains_delete_admin" ON blacklisted_domains;
CREATE POLICY "blacklisted_domains_delete_admin" ON blacklisted_domains
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- ============ LINKS POLICIES ============
DROP POLICY IF EXISTS "links_select_member" ON links;
CREATE POLICY "links_select_member" ON links FOR SELECT
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
    OR is_current_user_admin()
  );

DROP POLICY IF EXISTS "links_select_public" ON links;
CREATE POLICY "links_select_public" ON links FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "links_select_guest_own" ON links;
CREATE POLICY "links_select_guest_own" ON links FOR SELECT
  TO anon, authenticated USING (is_guest = true AND guest_session_id IS NOT NULL);

DROP POLICY IF EXISTS "links_insert_guest" ON links;
CREATE POLICY "links_insert_guest" ON links FOR INSERT
  TO anon, authenticated WITH CHECK (is_guest = true AND workspace_id IS NULL);

DROP POLICY IF EXISTS "links_insert_member" ON links;
CREATE POLICY "links_insert_member" ON links FOR INSERT
  TO authenticated WITH CHECK (
    is_guest = false AND workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "links_update_member" ON links;
CREATE POLICY "links_update_member" ON links FOR UPDATE
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "links_update_claim" ON links;
CREATE POLICY "links_update_claim" ON links FOR UPDATE
  TO authenticated USING (is_guest = true AND guest_session_id IS NOT NULL)
  WITH CHECK (is_guest = false AND creator_id = auth.uid());

DROP POLICY IF EXISTS "links_delete_member" ON links;
CREATE POLICY "links_delete_member" ON links FOR DELETE
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  );

-- ============ CLICKS POLICIES ============
DROP POLICY IF EXISTS "clicks_select_member" ON clicks;
CREATE POLICY "clicks_select_member" ON clicks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = clicks.workspace_id AND wm.user_id = auth.uid())
    OR is_current_user_admin()
  );

DROP POLICY IF EXISTS "clicks_insert_public" ON clicks;
CREATE POLICY "clicks_insert_public" ON clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "clicks_select_public" ON clicks;
CREATE POLICY "clicks_select_public" ON clicks FOR SELECT
  TO anon, authenticated USING (true);

-- ============ API_KEYS POLICIES ============
DROP POLICY IF EXISTS "apikeys_select_member" ON api_keys;
CREATE POLICY "apikeys_select_member" ON api_keys FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = api_keys.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "apikeys_insert_member" ON api_keys;
CREATE POLICY "apikeys_insert_member" ON api_keys FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = api_keys.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "apikeys_update_member" ON api_keys;
CREATE POLICY "apikeys_update_member" ON api_keys FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = api_keys.workspace_id AND wm.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = api_keys.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "apikeys_delete_member" ON api_keys;
CREATE POLICY "apikeys_delete_member" ON api_keys FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = api_keys.workspace_id AND wm.user_id = auth.uid())
  );

-- ============ ABUSE_FLAGS POLICIES ============
DROP POLICY IF EXISTS "abuse_select_admin" ON abuse_flags;
CREATE POLICY "abuse_select_admin" ON abuse_flags FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_insert_admin" ON abuse_flags;
CREATE POLICY "abuse_insert_admin" ON abuse_flags FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "abuse_insert_member" ON abuse_flags;
CREATE POLICY "abuse_insert_member" ON abuse_flags FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "abuse_update_admin" ON abuse_flags;
CREATE POLICY "abuse_update_admin" ON abuse_flags FOR UPDATE
  TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_delete_admin" ON abuse_flags;
CREATE POLICY "abuse_delete_admin" ON abuse_flags FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ DOMAINS POLICIES ============
DROP POLICY IF EXISTS "domains_select_member" ON domains;
CREATE POLICY "domains_select_member" ON domains FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "domains_insert_member" ON domains;
CREATE POLICY "domains_insert_member" ON domains FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "domains_update_member" ON domains;
CREATE POLICY "domains_update_member" ON domains FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "domains_delete_member" ON domains;
CREATE POLICY "domains_delete_member" ON domains FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

-- ============ ANNOUNCEMENTS POLICIES ============
DROP POLICY IF EXISTS "announcements_select_all" ON announcements;
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "announcements_insert_admin" ON announcements;
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "announcements_update_admin" ON announcements;
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE
  TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "announcements_delete_admin" ON announcements;
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ BANNED_USERS POLICIES ============
DROP POLICY IF EXISTS "banned_users_select_admin" ON banned_users;
CREATE POLICY "banned_users_select_admin" ON banned_users FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "banned_users_insert_admin" ON banned_users;
CREATE POLICY "banned_users_insert_admin" ON banned_users FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "banned_users_update_admin" ON banned_users;
CREATE POLICY "banned_users_update_admin" ON banned_users FOR UPDATE
  TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "banned_users_delete_admin" ON banned_users;
CREATE POLICY "banned_users_delete_admin" ON banned_users FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ FEATURED_LINKS POLICIES ============
DROP POLICY IF EXISTS "featured_select_all" ON featured_links;
CREATE POLICY "featured_select_all" ON featured_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "featured_insert_admin" ON featured_links;
CREATE POLICY "featured_insert_admin" ON featured_links FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "featured_delete_admin" ON featured_links;
CREATE POLICY "featured_delete_admin" ON featured_links FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ IP_BLOCKS POLICIES ============
DROP POLICY IF EXISTS "ip_blocks_select_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_select_admin" ON ip_blocks FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "ip_blocks_insert_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_insert_admin" ON ip_blocks FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "ip_blocks_delete_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_delete_admin" ON ip_blocks FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ SUPPORT_TICKETS POLICIES ============
DROP POLICY IF EXISTS "tickets_select_own_or_admin" ON support_tickets;
CREATE POLICY "tickets_select_own_or_admin" ON support_tickets FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR is_current_user_admin());

DROP POLICY IF EXISTS "tickets_insert_own" ON support_tickets;
CREATE POLICY "tickets_insert_own" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));

DROP POLICY IF EXISTS "tickets_insert_anon" ON support_tickets;
CREATE POLICY "tickets_insert_anon" ON support_tickets FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "tickets_update_own_or_admin" ON support_tickets;
CREATE POLICY "tickets_update_own_or_admin" ON support_tickets FOR UPDATE
  TO authenticated USING (user_id = auth.uid() OR is_current_user_admin())
  WITH CHECK (user_id = auth.uid() OR is_current_user_admin());

-- ============ DEPLOY_KEYS POLICIES ============
DROP POLICY IF EXISTS "noop_deploy_keys" ON deploy_keys;
CREATE POLICY "noop_deploy_keys" ON deploy_keys
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- ============ RATE_LIMITS POLICIES ============
DROP POLICY IF EXISTS "rate_limits_service_only" ON rate_limits;
CREATE POLICY "rate_limits_service_only" ON rate_limits
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ============ INDEXES ============
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_alias ON links (alias);
CREATE INDEX IF NOT EXISTS idx_links_workspace ON links (workspace_id);
CREATE INDEX IF NOT EXISTS idx_links_creator ON links (creator_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks (link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_workspace ON clicks (workspace_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks (created_at);
CREATE INDEX IF NOT EXISTS idx_wm_workspace ON workspace_members (workspace_id);
CREATE INDEX IF NOT EXISTS idx_wm_user ON workspace_members (user_id);
CREATE INDEX IF NOT EXISTS idx_apikeys_workspace ON api_keys (workspace_id);
CREATE INDEX IF NOT EXISTS idx_promo_active ON promo_urls (is_active);
CREATE INDEX IF NOT EXISTS idx_abuse_user ON abuse_flags (user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_link ON abuse_flags (link_id);
CREATE INDEX IF NOT EXISTS idx_links_guest_session ON links (guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_is_guest ON links (is_guest) WHERE is_guest = true;
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_domains_workspace ON domains (workspace_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains (domain);
CREATE INDEX IF NOT EXISTS idx_featured_link ON featured_links (link_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits (identifier, action, window_start);

-- ============ TRIGGERS: updated_at ============
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS workspaces_set_updated_at ON workspaces;
DROP TRIGGER IF EXISTS set_updated_at_workspaces ON workspaces;
CREATE TRIGGER set_updated_at_workspaces BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS links_set_updated_at ON links;
DROP TRIGGER IF EXISTS set_updated_at_links ON links;
CREATE TRIGGER set_updated_at_links BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS api_keys_set_updated_at ON api_keys;
DROP TRIGGER IF EXISTS set_updated_at_api_keys ON api_keys;
CREATE TRIGGER set_updated_at_api_keys BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS promo_urls_set_updated_at ON promo_urls;
DROP TRIGGER IF EXISTS set_updated_at_promo_urls ON promo_urls;
CREATE TRIGGER set_updated_at_promo_urls BEFORE UPDATE ON promo_urls
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS platform_settings_set_updated_at ON platform_settings;
DROP TRIGGER IF EXISTS set_updated_at_platform_settings ON platform_settings;
CREATE TRIGGER set_updated_at_platform_settings BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS domains_set_updated_at ON domains;
CREATE TRIGGER domains_set_updated_at BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ TRIGGERS: auto-increment click count ============
CREATE OR REPLACE FUNCTION increment_link_click_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE links SET total_clicks = total_clicks + 1 WHERE id = NEW.link_id;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS on_click_inserted ON clicks;
CREATE TRIGGER on_click_inserted
  AFTER INSERT ON clicks
  FOR EACH ROW EXECUTE FUNCTION increment_link_click_count();

-- ============ TRIGGERS: auto-create profile + workspace on signup ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  ws_id uuid;
  ws_slug text;
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.email, '')
  );

  ws_slug := 'ws-' || left(encode(extensions.gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (
    COALESCE(split_part(NEW.email, '@', 1), 'my-workspace'),
    ws_slug,
    NEW.id
  )
  RETURNING id INTO ws_id;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, NEW.id, 'owner');

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ RPC FUNCTIONS ============

CREATE OR REPLACE FUNCTION increment_link_counters(link_id_input uuid, is_promo boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE links
  SET total_clicks = total_clicks + 1,
      promo_clicks = promo_clicks + (CASE WHEN is_promo THEN 1 ELSE 0 END)
  WHERE id = link_id_input;
END
$$;

CREATE OR REPLACE FUNCTION increment_promo_sends(promo_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE promo_urls SET total_sends = total_sends + 1 WHERE id = promo_id;
END
$$;

CREATE OR REPLACE FUNCTION verify_password(pw text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  IF hash IS NULL OR hash = '' THEN
    RETURN true;
  END IF;
  RETURN extensions.crypt(pw, hash) = hash;
END;
$$;

CREATE OR REPLACE FUNCTION hash_password(pw text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN extensions.crypt(pw, extensions.gen_salt('bf'));
END;
$$;

CREATE OR REPLACE FUNCTION claim_guest_links(p_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_claimed_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT id INTO v_workspace_id FROM workspaces WHERE owner_id = v_user_id LIMIT 1;

  IF v_workspace_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No workspace found');
  END IF;

  UPDATE links
  SET
    creator_id = v_user_id,
    workspace_id = v_workspace_id,
    is_guest = false,
    expires_at = NULL,
    guest_session_id = NULL,
    updated_at = now()
  WHERE is_guest = true
    AND guest_session_id = p_session_id
    AND expires_at IS NOT NULL;

  GET DIAGNOSTICS v_claimed_count = ROW_COUNT;
  RETURN jsonb_build_object('claimed_count', v_claimed_count);
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_expired_guest_links()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM links
  WHERE is_guest = true
    AND expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION ensure_user_workspace()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  ws_id uuid;
  ws_slug text;
BEGIN
  SELECT id INTO ws_id FROM workspaces WHERE owner_id = auth.uid() LIMIT 1;
  IF ws_id IS NULL THEN
    ws_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);
    INSERT INTO workspaces (name, slug, owner_id)
    VALUES ('My Workspace', ws_slug, auth.uid())
    RETURNING id INTO ws_id;

    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (ws_id, auth.uid(), 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS get_analytics_by_period(integer);
CREATE FUNCTION get_analytics_by_period(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', d::date::text,
        'clicks', click_count,
        'links', link_count
      ) ORDER BY d)
      FROM (
        SELECT
          d,
          (SELECT count(*) FROM clicks c WHERE date_trunc('day', c.created_at) = d) AS click_count,
          (SELECT count(*) FROM links l WHERE date_trunc('day', l.created_at) = d) AS link_count
        FROM generate_series(
          date_trunc('day', now() - interval '1 day' * p_days),
          date_trunc('day', now()),
          '1 day'
        ) AS d
      ) daily_data
    ), '[]'::jsonb),
    'total_clicks', (SELECT count(*) FROM clicks WHERE created_at > now() - interval '1 day' * p_days),
    'total_links', (SELECT count(*) FROM links WHERE created_at > now() - interval '1 day' * p_days),
    'top_countries', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('country', country, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(country, 'Unknown') AS country, count(*) AS cnt
        FROM clicks WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY country ORDER BY cnt DESC LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_browsers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('browser', browser, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(browser, 'Unknown') AS browser, count(*) AS cnt
        FROM clicks WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY browser ORDER BY cnt DESC LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_devices', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('device', device, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(device, 'Unknown') AS device, count(*) AS cnt
        FROM clicks WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY device ORDER BY cnt DESC LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_links', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('alias', alias, 'url', original_url, 'clicks', total_clicks) ORDER BY total_clicks DESC)
      FROM (
        SELECT alias, original_url, total_clicks
        FROM links WHERE created_at > now() - interval '1 day' * p_days
        ORDER BY total_clicks DESC LIMIT 10
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- ============ SEED DATA ============
INSERT INTO platform_settings (id, promo_enabled, redirect_percentage, signup_bonus_clicks)
VALUES (1, true, 0.20, 0)
ON CONFLICT (id) DO NOTHING;

-- ============ BACKFILL WORKSPACES FOR EXISTING USERS ============
DO $$
DECLARE
  u RECORD;
  v_ws_id uuid;
  v_slug text;
BEGIN
  FOR u IN
    SELECT au.id, au.email
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM workspaces w WHERE w.owner_id = au.id)
  LOOP
    v_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);
    INSERT INTO workspaces (name, slug, owner_id)
    VALUES (COALESCE(split_part(u.email, '@', 1), 'my-workspace'), v_slug, u.id)
    RETURNING id INTO v_ws_id;

    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (v_ws_id, u.id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    INSERT INTO profiles (id, email)
    VALUES (u.id, COALESCE(u.email, ''))
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- ============ REFRESH POSTGREST SCHEMA CACHE ============
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- END OF database.sql
-- After running this in Supabase SQL Editor, all 18 tables will be created
-- with correct columns, RLS policies, triggers, functions, and indexes.
-- ============================================================================
