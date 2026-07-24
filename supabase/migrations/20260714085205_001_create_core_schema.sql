/*
# Core schema for LinkShare SaaS (URL shortener with traffic-sharing model)

## Overview
Creates the foundational tables for a URL shortener SaaS where all premium features
are free, funded by a traffic-sharing system: a configurable percentage of visitors
to shortened links are randomly redirected to platform-managed promotional URLs.

## New Tables
- profiles: extends auth.users with full_name, avatar_url, is_admin
- workspaces: team workspaces with name, slug, owner
- workspace_members: join table (user, workspace, role)
- promo_urls: platform-managed promotional destinations
- platform_settings: single-row global config (redirect %, promo enabled)
- blacklisted_domains: admin-controlled banned destination domains
- links: core short link entity with alias, targeting, UTM, QR, counters
- clicks: immutable click log for analytics
- api_keys: developer API keys (hashed)
- abuse_flags: suspicious activity records

## Security (RLS)
- profiles: authenticated users read/update own; admins read all
- workspaces: members can CRUD their workspaces
- workspace_members: members read; owners manage
- links: workspace members can CRUD
- clicks: workspace members read; inserts via service role / edge fn
- promo_urls / blacklisted_domains / platform_settings: public read (redirect fn + landing page), admin write
- api_keys: workspace members manage own keys
- abuse_flags: admin only

## Important Notes
1. Multi-tenant (signed-in) app. Owner columns default to auth.uid().
2. The redirect edge function uses the service role key and bypasses RLS for click inserts and link lookups — that is expected.
3. promo_urls / blacklisted_domains / platform_settings are anon-readable because the redirect edge function and public landing page need them.
*/

-- ============ TABLE CREATION (all tables first, policies after) ============

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
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
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
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
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
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
  created_at timestamptz NOT NULL DEFAULT now()
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

-- ============ Enable RLS ============
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

-- ============ profiles policies ============
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============ workspaces policies ============
DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;
CREATE POLICY "workspaces_select_member" ON workspaces FOR SELECT
  TO authenticated USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "workspaces_insert_own" ON workspaces;
CREATE POLICY "workspaces_insert_own" ON workspaces FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_update_own" ON workspaces;
CREATE POLICY "workspaces_update_own" ON workspaces FOR UPDATE
  TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_delete_own" ON workspaces;
CREATE POLICY "workspaces_delete_own" ON workspaces FOR DELETE
  TO authenticated USING (owner_id = auth.uid());

-- ============ workspace_members policies ============
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

-- ============ promo_urls policies ============
DROP POLICY IF EXISTS "promo_select_public" ON promo_urls;
CREATE POLICY "promo_select_public" ON promo_urls FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "promo_insert_admin" ON promo_urls;
CREATE POLICY "promo_insert_admin" ON promo_urls
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "promo_update_admin" ON promo_urls;
CREATE POLICY "promo_update_admin" ON promo_urls
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "promo_delete_admin" ON promo_urls;
CREATE POLICY "promo_delete_admin" ON promo_urls
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- ============ platform_settings policies ============
DROP POLICY IF EXISTS "settings_select_public" ON platform_settings;
CREATE POLICY "settings_select_public" ON platform_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_admin" ON platform_settings;
CREATE POLICY "settings_update_admin" ON platform_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- ============ blacklisted_domains policies ============
DROP POLICY IF EXISTS "blacklist_select_public" ON blacklisted_domains;
CREATE POLICY "blacklist_select_public" ON blacklisted_domains FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blacklist_insert_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_insert_admin" ON blacklisted_domains
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "blacklist_delete_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_delete_admin" ON blacklisted_domains
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- ============ links policies ============
DROP POLICY IF EXISTS "links_select_member" ON links;
CREATE POLICY "links_select_member" ON links FOR SELECT
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "links_insert_member" ON links;
CREATE POLICY "links_insert_member" ON links FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "links_update_member" ON links;
CREATE POLICY "links_update_member" ON links FOR UPDATE
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "links_delete_member" ON links;
CREATE POLICY "links_delete_member" ON links FOR DELETE
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
  );

-- ============ clicks policies ============
DROP POLICY IF EXISTS "clicks_select_member" ON clicks;
CREATE POLICY "clicks_select_member" ON clicks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = clicks.workspace_id AND wm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- ============ api_keys policies ============
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

-- ============ abuse_flags policies ============
DROP POLICY IF EXISTS "abuse_select_admin" ON abuse_flags;
CREATE POLICY "abuse_select_admin" ON abuse_flags FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "abuse_insert_admin" ON abuse_flags;
CREATE POLICY "abuse_insert_admin" ON abuse_flags FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "abuse_update_admin" ON abuse_flags;
CREATE POLICY "abuse_update_admin" ON abuse_flags FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "abuse_delete_admin" ON abuse_flags;
CREATE POLICY "abuse_delete_admin" ON abuse_flags FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_links_alias ON links (alias);
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

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS workspaces_set_updated_at ON workspaces;
CREATE TRIGGER workspaces_set_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS links_set_updated_at ON links;
CREATE TRIGGER links_set_updated_at BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS promo_urls_set_updated_at ON promo_urls;
CREATE TRIGGER promo_urls_set_updated_at BEFORE UPDATE ON promo_urls
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS api_keys_set_updated_at ON api_keys;
CREATE TRIGGER api_keys_set_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS platform_settings_set_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_set_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ Auto-create profile + workspace on signup ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ws_id uuid;
  ws_slug text;
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''));

  ws_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (COALESCE(split_part(NEW.email, '@', 1), 'my-workspace'), ws_slug, NEW.id)
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

-- Seed the single settings row.
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

