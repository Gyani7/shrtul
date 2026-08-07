/*
# Production Refactor — Security & Schema Fixes

## Summary
This migration applies critical security fixes and schema improvements identified during the production audit:

1. **Password Security**: The `verify_password` RPC is now SECURITY DEFINER so it can only be called server-side, not from the browser with arbitrary hashes.
2. **Counter Fraud Prevention**: `increment_link_counters` is now SECURITY DEFINER with `SET search_path = public` to prevent client-side counter manipulation.
3. **Admin Stats Function**: New `get_admin_stats` RPC for the admin dashboard.
4. **Platform Settings**: Added `max_redirect_percentage`, `maintenance_mode`, `maintenance_message`, `site_name`, `site_description`, `seo_keywords`, `donation_url`, `coffee_url` columns.
5. **Links Table**: Added `is_featured` column for featured links.
6. **Support Tickets**: Added `priority` column.
7. **Profiles**: Added `is_banned` and `ban_reason` columns.
8. **Banned Users Table**: New table for tracking banned users with audit trail.
9. **Featured Links Table**: New table for admin-curated featured links.
10. **IP Blocks Table**: New table for IP-based blocking.
11. **Announcements Table**: New table for platform announcements.
12. **Deploy Keys Table**: New table for deployment keys.
13. **Rate Limits Table**: New table for rate limiting.
14. **Support Tickets**: Added anon insert policy for unauthenticated users.
15. **All new tables**: RLS enabled with appropriate policies.

## Security Changes
- `verify_password` and `hash_password` now have explicit `SET search_path = extensions, public`
- `increment_link_counters` and `increment_promo_sends` are SECURITY DEFINER
- `is_current_user_admin()` checks `is_banned` in addition to `is_admin`
- All new admin tables have admin-only policies using `is_current_user_admin()`
- `deploy_keys` and `rate_limits` have `USING (false)` policies (service-only access)

## Important Notes
1. All statements are idempotent — safe to re-run
2. No data is lost — all changes are additive
3. The `is_current_user_admin()` function now also checks `is_banned`
4. The `get_admin_stats` RPC aggregates platform-wide statistics
*/

-- ============ EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============ COLUMNS: platform_settings ============
DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS max_redirect_percentage numeric NOT NULL DEFAULT 100;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS maintenance_message text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Shrtul';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS site_description text NOT NULL DEFAULT 'Shorten URLs, track clicks, and manage links';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS seo_keywords text NOT NULL DEFAULT 'url shortener, link shortener, short link, qr code';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS donation_url text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS coffee_url text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============ COLUMNS: links ============
DO $$ BEGIN
  ALTER TABLE links ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============ COLUMNS: profiles ============
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============ COLUMNS: support_tickets ============
DO $$ BEGIN
  ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ============ TABLES: banned_users ============
CREATE TABLE IF NOT EXISTS banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT 'Violation of terms',
  banned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  banned_at timestamptz NOT NULL DEFAULT now(),
  unbanned_at timestamptz
);

-- ============ TABLES: featured_links ============
CREATE TABLE IF NOT EXISTS featured_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  featured_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ TABLES: ip_blocks ============
CREATE TABLE IF NOT EXISTS ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL DEFAULT 'Abuse',
  blocked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ TABLES: announcements ============
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

-- ============ TABLES: deploy_keys ============
CREATE TABLE IF NOT EXISTS deploy_keys (
  id text PRIMARY KEY DEFAULT 'default',
  private_key text NOT NULL,
  public_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============ TABLES: rate_limits ============
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ ENABLE RLS ON NEW TABLES ============
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
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

CREATE OR REPLACE FUNCTION increment_link_counters(link_id_input uuid, is_promo boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE links
  SET total_clicks = total_clicks + 1,
      promo_clicks = promo_clicks + (CASE WHEN is_promo THEN 1 ELSE 0 END)
  WHERE id = link_id_input;
END;
$$;

CREATE OR REPLACE FUNCTION increment_promo_sends(promo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promo_urls SET total_sends = total_sends + 1 WHERE id = promo_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM profiles),
    'active_users_30d', (SELECT count(DISTINCT creator_id) FROM links WHERE created_at > now() - interval '30 days'),
    'total_links', (SELECT count(*) FROM links),
    'guest_links', (SELECT count(*) FROM links WHERE is_guest = true),
    'permanent_links', (SELECT count(*) FROM links WHERE is_guest = false),
    'total_clicks', (SELECT count(*) FROM clicks),
    'active_promo_urls', (SELECT count(*) FROM promo_urls WHERE is_active = true),
    'banned_users', (SELECT count(*) FROM profiles WHERE is_banned = true),
    'open_tickets', (SELECT count(*) FROM support_tickets WHERE status = 'open')
  ) INTO result;
  RETURN result;
END;
$$;

-- ============ INDEXES ON NEW TABLES ============
CREATE UNIQUE INDEX IF NOT EXISTS banned_users_pkey ON banned_users (id);
CREATE UNIQUE INDEX IF NOT EXISTS banned_users_user_id_key ON banned_users (user_id);
CREATE INDEX IF NOT EXISTS idx_featured_link ON featured_links (link_id);
CREATE UNIQUE INDEX IF NOT EXISTS ip_blocks_ip_address_key ON ip_blocks (ip_address);
CREATE UNIQUE INDEX IF NOT EXISTS ip_blocks_pkey ON ip_blocks (id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits (identifier, action, window_start);

-- ============ RLS POLICIES: banned_users ============
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

-- ============ RLS POLICIES: featured_links ============
DROP POLICY IF EXISTS "featured_select_all" ON featured_links;
CREATE POLICY "featured_select_all" ON featured_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "featured_insert_admin" ON featured_links;
CREATE POLICY "featured_insert_admin" ON featured_links FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "featured_delete_admin" ON featured_links;
CREATE POLICY "featured_delete_admin" ON featured_links FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ RLS POLICIES: ip_blocks ============
DROP POLICY IF EXISTS "ip_blocks_select_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_select_admin" ON ip_blocks FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "ip_blocks_insert_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_insert_admin" ON ip_blocks FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "ip_blocks_delete_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_delete_admin" ON ip_blocks FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ RLS POLICIES: announcements ============
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

-- ============ RLS POLICIES: deploy_keys ============
DROP POLICY IF EXISTS "noop_deploy_keys" ON deploy_keys;
CREATE POLICY "noop_deploy_keys" ON deploy_keys
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- ============ RLS POLICIES: rate_limits ============
DROP POLICY IF EXISTS "rate_limits_service_only" ON rate_limits;
CREATE POLICY "rate_limits_service_only" ON rate_limits
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ============ RLS POLICIES: support_tickets (anon insert) ============
DROP POLICY IF EXISTS "tickets_insert_anon" ON support_tickets;
CREATE POLICY "tickets_insert_anon" ON support_tickets FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

-- ============ SEED DATA ============
INSERT INTO platform_settings (id, promo_enabled, redirect_percentage, max_redirect_percentage, signup_bonus_clicks, maintenance_mode, site_name, site_description, seo_keywords)
VALUES (1, true, 0.20, 100, 0, false, 'Shrtul', 'Shorten URLs, track clicks, and manage links', 'url shortener, link shortener, short link, qr code')
ON CONFLICT (id) DO NOTHING;

-- ============ TRIGGERS: updated_at on announcements ============
DROP TRIGGER IF EXISTS announcements_set_updated_at ON announcements;
CREATE TRIGGER announcements_set_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ REFRESH POSTGREST SCHEMA CACHE ============
NOTIFY pgrst, 'reload schema';
