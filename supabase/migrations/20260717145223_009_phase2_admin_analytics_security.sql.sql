/*
# 009: Phase 2 — Admin portal, support tickets, announcements, featured links, banned users, rate limits, SEO settings
*/

-- ============ banned_users table ============
CREATE TABLE IF NOT EXISTS banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT 'Violation of terms',
  banned_by uuid REFERENCES profiles(id),
  banned_at timestamptz NOT NULL DEFAULT now(),
  unbanned_at timestamptz
);

ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banned_users_select_admin" ON banned_users;
CREATE POLICY "banned_users_select_admin" ON banned_users FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "banned_users_insert_admin" ON banned_users;
CREATE POLICY "banned_users_insert_admin" ON banned_users FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "banned_users_update_admin" ON banned_users;
CREATE POLICY "banned_users_update_admin" ON banned_users FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "banned_users_delete_admin" ON banned_users;
CREATE POLICY "banned_users_delete_admin" ON banned_users FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ============ support_tickets table ============
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_own_or_admin" ON support_tickets;
CREATE POLICY "tickets_select_own_or_admin" ON support_tickets FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "tickets_insert_own" ON support_tickets;
CREATE POLICY "tickets_insert_own" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "tickets_update_own_or_admin" ON support_tickets;
CREATE POLICY "tickets_update_own_or_admin" ON support_tickets FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  ) WITH CHECK (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_set_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ announcements table ============
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','success','maintenance')),
  is_active boolean NOT NULL DEFAULT true,
  is_dismissible boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_select_all" ON announcements;
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "announcements_insert_admin" ON announcements;
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "announcements_update_admin" ON announcements;
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "announcements_delete_admin" ON announcements;
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP TRIGGER IF EXISTS announcements_set_updated_at ON announcements;
CREATE TRIGGER announcements_set_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ featured_links table ============
CREATE TABLE IF NOT EXISTS featured_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  featured_by uuid REFERENCES profiles(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE featured_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "featured_select_all" ON featured_links;
CREATE POLICY "featured_select_all" ON featured_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "featured_insert_admin" ON featured_links;
CREATE POLICY "featured_insert_admin" ON featured_links FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "featured_delete_admin" ON featured_links;
CREATE POLICY "featured_delete_admin" ON featured_links FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS idx_featured_link ON featured_links (link_id);

-- ============ ip_blocks table ============
CREATE TABLE IF NOT EXISTS ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL DEFAULT 'Abuse',
  blocked_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ip_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ip_blocks_select_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_select_admin" ON ip_blocks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "ip_blocks_insert_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_insert_admin" ON ip_blocks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "ip_blocks_delete_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_delete_admin" ON ip_blocks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ============ rate_limits table (for tracking) ============
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits FORCE ROW LEVEL SECURITY;

-- Only service role can access rate_limits
DROP POLICY IF EXISTS "rate_limits_service_only" ON rate_limits;
CREATE POLICY "rate_limits_service_only" ON rate_limits FOR ALL
  TO authenticated USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits (identifier, action, window_start);

-- ============ Add columns to platform_settings ============
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS maintenance_message text NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS max_redirect_percentage integer NOT NULL DEFAULT 20;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Shrtul';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS site_description text NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS seo_keywords text NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS donation_url text NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS coffee_url text NOT NULL DEFAULT '';

-- ============ Add is_featured column to links ============
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- ============ Add is_banned column to profiles ============
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;

-- ============ Add utm columns to clicks ============
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS is_unique boolean NOT NULL DEFAULT true;

-- ============ Add indexes for analytics ============
CREATE INDEX IF NOT EXISTS idx_clicks_link_created ON clicks (link_id, created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks (country);
CREATE INDEX IF NOT EXISTS idx_clicks_browser ON clicks (browser);
CREATE INDEX IF NOT EXISTS idx_clicks_device ON clicks (device);
CREATE INDEX IF NOT EXISTS idx_clicks_os ON clicks (os);
CREATE INDEX IF NOT EXISTS idx_clicks_referer ON clicks (referer);
CREATE INDEX IF NOT EXISTS idx_links_is_featured ON links (is_featured);
CREATE INDEX IF NOT EXISTS idx_links_is_guest ON links (is_guest);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles (is_banned);

-- ============ Admin stats RPC ============
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users integer;
  v_active_users integer;
  v_banned_users integer;
  v_total_links integer;
  v_guest_links integer;
  v_registered_links integer;
  v_total_clicks bigint;
  v_featured_links integer;
  v_open_tickets integer;
  v_active_announcements integer;
BEGIN
  SELECT count(*) INTO v_total_users FROM profiles;
  SELECT count(*) INTO v_active_users FROM profiles WHERE is_banned = false;
  SELECT count(*) INTO v_banned_users FROM profiles WHERE is_banned = true;
  SELECT count(*) INTO v_total_links FROM links;
  SELECT count(*) INTO v_guest_links FROM links WHERE is_guest = true;
  SELECT count(*) INTO v_registered_links FROM links WHERE is_guest = false;
  SELECT COALESCE(sum(total_clicks), 0) INTO v_total_clicks FROM links;
  SELECT count(*) INTO v_featured_links FROM links WHERE is_featured = true;
  SELECT count(*) INTO v_open_tickets FROM support_tickets WHERE status = 'open';
  SELECT count(*) INTO v_active_announcements FROM announcements WHERE is_active = true;

  RETURN jsonb_build_object(
    'total_users', v_total_users,
    'active_users', v_active_users,
    'banned_users', v_banned_users,
    'total_links', v_total_links,
    'guest_links', v_guest_links,
    'registered_links', v_registered_links,
    'total_clicks', v_total_clicks,
    'featured_links', v_featured_links,
    'open_tickets', v_open_tickets,
    'active_announcements', v_active_announcements
  );
END;
$$;

-- ============ Analytics by period RPC ============
CREATE OR REPLACE FUNCTION get_analytics_by_period(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', d::date,
        'clicks', count(c.id)
      ) ORDER BY d)
      FROM generate_series(
        date_trunc('day', now() - interval '1 day' * p_days),
        date_trunc('day', now()),
        '1 day'
      ) AS d
      LEFT JOIN clicks c ON date_trunc('day', c.created_at) = d
      GROUP BY d
    ), '[]'::jsonb),
    'top_countries', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'country', country,
        'count', cnt
      ) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(country, 'Unknown') AS country, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY country
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_browsers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'browser', browser,
        'count', cnt
      ) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(browser, 'Unknown') AS browser, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY browser
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_devices', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'device', device,
        'count', cnt
      ) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(device, 'Unknown') AS device, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY device
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_os', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'os', os,
        'count', cnt
      ) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(os, 'Unknown') AS os, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY os
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_referrers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'referer', referer,
        'count', cnt
      ) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(referer, 'Direct') AS referer, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY referer
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_links', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'alias', l.alias,
        'url', l.original_url,
        'clicks', l.total_clicks
      ) ORDER BY l.total_clicks DESC)
      FROM links l
      WHERE l.created_at > now() - interval '1 day' * p_days
      ORDER BY l.total_clicks DESC
      LIMIT 10
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============ Refresh schema cache ============
NOTIFY pgrst, 'reload schema';
