-- ============================================================================
-- Complete Schema Consolidation Migration
-- Idempotent: safe to re-run. Creates all tables, columns, indexes, triggers,
-- constraints, RLS policies, and functions required by the application.
-- No mock data. No data loss. Additive only.
-- ============================================================================

-- ============ EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============ TABLES ============

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  email text DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text,
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
  max_redirect_percentage integer NOT NULL DEFAULT 20,
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text NOT NULL DEFAULT '',
  site_name text NOT NULL DEFAULT 'Shrtul',
  site_description text NOT NULL DEFAULT 'Shorten URLs, track clicks, and manage links',
  seo_keywords text NOT NULL DEFAULT 'url shortener, link shortener, short link, qr code',
  donation_url text NOT NULL DEFAULT '',
  coffee_url text NOT NULL DEFAULT '',
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
  is_guest boolean NOT NULL DEFAULT false,
  guest_session_id text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
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
  utm_source text,
  utm_medium text,
  utm_campaign text,
  is_unique boolean NOT NULL DEFAULT false,
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

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  admin_reply text,
  replied_at timestamptz,
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

CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  is_verified boolean NOT NULL DEFAULT false,
  is_primary boolean NOT NULL DEFAULT false,
  verification_token text,
  ssl_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plugin_key text NOT NULL,
  name text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0.0',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, plugin_key)
);

CREATE TABLE IF NOT EXISTS marketplace_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  template_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'engagement',
  icon text NOT NULL DEFAULT 'Sparkles',
  config_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text,
  price_cents integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  install_count integer NOT NULL DEFAULT 0,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  purchased_by uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  price_paid_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, template_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  links_created integer NOT NULL DEFAULT 0,
  clicks_recorded integer NOT NULL DEFAULT 0,
  api_calls integer NOT NULL DEFAULT 0,
  custom_domains integer NOT NULL DEFAULT 0,
  period_start date NOT NULL DEFAULT date_trunc('month', now())::date,
  period_end date NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT false,
  in_app_enabled boolean NOT NULL DEFAULT true,
  click_alerts boolean NOT NULL DEFAULT true,
  quota_alerts boolean NOT NULL DEFAULT true,
  security_alerts boolean NOT NULL DEFAULT true,
  product_updates boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status integer,
  response_body text,
  delivered boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ ADD MISSING COLUMNS (idempotent) ============

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;

ALTER TABLE links ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;
ALTER TABLE links ADD COLUMN IF NOT EXISTS guest_session_id text;
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS is_unique boolean NOT NULL DEFAULT false;
ALTER TABLE clicks ALTER COLUMN is_unique SET DEFAULT false;
ALTER TABLE clicks ALTER COLUMN workspace_id DROP NOT NULL;

ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS max_redirect_percentage integer NOT NULL DEFAULT 20;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS maintenance_message text NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Shrtul';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS site_description text NOT NULL DEFAULT 'Shorten URLs, track clicks, and manage links';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS seo_keywords text NOT NULL DEFAULT 'url shortener, link shortener, short link, qr code';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS donation_url text NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS coffee_url text NOT NULL DEFAULT '';

ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS admin_reply text;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS replied_at timestamptz;

ALTER TABLE links ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE links ALTER COLUMN creator_id DROP NOT NULL;

-- ============ CONSTRAINTS ============

DO $$ BEGIN
  ALTER TABLE links ADD CONSTRAINT links_original_url_not_empty
    CHECK (original_url IS NOT NULL AND length(btrim(original_url)) > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_links_alias ON links (alias);
CREATE INDEX IF NOT EXISTS idx_links_workspace ON links (workspace_id);
CREATE INDEX IF NOT EXISTS idx_links_creator ON links (creator_id);
CREATE INDEX IF NOT EXISTS idx_links_guest_session ON links (guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_is_guest ON links (is_guest) WHERE is_guest = true;
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks (link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_workspace ON clicks (workspace_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks (created_at);
CREATE INDEX IF NOT EXISTS idx_wm_workspace ON workspace_members (workspace_id);
CREATE INDEX IF NOT EXISTS idx_wm_user ON workspace_members (user_id);
CREATE INDEX IF NOT EXISTS idx_apikeys_workspace ON api_keys (workspace_id);
CREATE INDEX IF NOT EXISTS idx_promo_active ON promo_urls (is_active);
CREATE INDEX IF NOT EXISTS idx_abuse_user ON abuse_flags (user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_link ON abuse_flags (link_id);
CREATE INDEX IF NOT EXISTS idx_plugins_workspace ON plugins(workspace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_published ON marketplace_templates(is_published);
CREATE INDEX IF NOT EXISTS idx_purchases_workspace ON marketplace_purchases(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quotas_workspace ON workspace_quotas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_webhooks_workspace ON webhooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_created ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits (identifier, action, window_start);
CREATE INDEX IF NOT EXISTS idx_featured_link ON featured_links (link_id);
CREATE INDEX IF NOT EXISTS idx_domains_workspace ON domains (workspace_id);

-- ============ FUNCTIONS ============

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;

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

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  ws_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (COALESCE(split_part(NEW.email, '@', 1), 'my-workspace'), ws_slug, NEW.id)
  RETURNING id INTO ws_id;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, NEW.id, 'owner');

  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION ensure_user_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_slug text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_workspace_id
  FROM workspaces WHERE owner_id = v_user_id LIMIT 1;

  IF v_workspace_id IS NOT NULL THEN
    RETURN v_workspace_id;
  END IF;

  SELECT workspace_id INTO v_workspace_id
  FROM workspace_members WHERE user_id = v_user_id LIMIT 1;

  IF v_workspace_id IS NOT NULL THEN
    RETURN v_workspace_id;
  END IF;

  v_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES ('my-workspace', v_slug, v_user_id)
  RETURNING id INTO v_workspace_id;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, v_user_id, 'owner');

  RETURN v_workspace_id;
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
END
$$;

CREATE OR REPLACE FUNCTION hash_password(pw text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  RETURN extensions.crypt(pw, extensions.gen_salt('bf'));
END
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
END
$$;

CREATE OR REPLACE FUNCTION increment_promo_sends(promo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promo_urls SET total_sends = total_sends + 1 WHERE id = promo_id;
END
$$;

CREATE OR REPLACE FUNCTION increment_install_count(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE marketplace_templates
  SET install_count = install_count + 1
  WHERE id = p_template_id;
END
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

  SELECT id INTO v_workspace_id
  FROM workspaces WHERE owner_id = v_user_id LIMIT 1;

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
END
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
END
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
END
$$;

CREATE OR REPLACE FUNCTION get_analytics_by_period(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_interval interval := (p_days || ' days')::interval;
BEGIN
  SELECT jsonb_build_object(
    'total_clicks', (SELECT count(*) FROM clicks WHERE created_at >= now() - v_interval),
    'total_links', (SELECT count(*) FROM links WHERE created_at >= now() - v_interval),
    'unique_visitors', (SELECT count(DISTINCT visitor_ip) FROM clicks WHERE created_at >= now() - v_interval),
    'promo_clicks', (SELECT count(*) FROM clicks WHERE is_promo_redirect = true AND created_at >= now() - v_interval),
    'by_day', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', d::date,
        'clicks', (SELECT count(*) FROM clicks WHERE created_at::date = d::date),
        'links', (SELECT count(*) FROM links WHERE created_at::date = d::date)
      ))
      FROM generate_series(now() - v_interval, now(), '1 day') AS d
    ), '[]'::jsonb),
    'top_links', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT alias, title, total_clicks
        FROM links
        WHERE created_at >= now() - v_interval
        ORDER BY total_clicks DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END
$$;

-- ============ TRIGGERS ============

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_set_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS announcements_set_updated_at ON announcements;
CREATE TRIGGER announcements_set_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS domains_set_updated_at ON domains;
CREATE TRIGGER domains_set_updated_at BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_plugins_updated ON plugins;
CREATE TRIGGER trg_plugins_updated BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_marketplace_templates_updated ON marketplace_templates;
CREATE TRIGGER trg_marketplace_templates_updated BEFORE UPDATE ON marketplace_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_workspace_quotas_updated ON workspace_quotas;
CREATE TRIGGER trg_workspace_quotas_updated BEFORE UPDATE ON workspace_quotas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_notification_preferences_updated ON notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_webhooks_updated ON webhooks;
CREATE TRIGGER trg_webhooks_updated BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS on_click_inserted ON clicks;
DROP FUNCTION IF EXISTS increment_link_click_count();

-- ============ RLS POLICIES ============

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- workspaces
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

-- workspace_members
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

-- promo_urls
DROP POLICY IF EXISTS "promo_select_public" ON promo_urls;
CREATE POLICY "promo_select_public" ON promo_urls FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "promo_insert_admin" ON promo_urls;
CREATE POLICY "promo_insert_admin" ON promo_urls
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "promo_update_admin" ON promo_urls;
CREATE POLICY "promo_update_admin" ON promo_urls
  FOR UPDATE TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "promo_delete_admin" ON promo_urls;
CREATE POLICY "promo_delete_admin" ON promo_urls
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- platform_settings
DROP POLICY IF EXISTS "settings_select_public" ON platform_settings;
CREATE POLICY "settings_select_public" ON platform_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_admin" ON platform_settings;
CREATE POLICY "settings_update_admin" ON platform_settings
  FOR UPDATE TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

-- blacklisted_domains
DROP POLICY IF EXISTS "blacklist_select_public" ON blacklisted_domains;
CREATE POLICY "blacklist_select_public" ON blacklisted_domains FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blacklist_insert_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_insert_admin" ON blacklisted_domains
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "blacklist_delete_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_delete_admin" ON blacklisted_domains
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- links
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
    is_guest = false
    AND workspace_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid()
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

-- clicks
DROP POLICY IF EXISTS "clicks_select_member" ON clicks;
CREATE POLICY "clicks_select_member" ON clicks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = clicks.workspace_id AND wm.user_id = auth.uid())
    OR is_current_user_admin()
  );

DROP POLICY IF EXISTS "clicks_select_public" ON clicks;
CREATE POLICY "clicks_select_public" ON clicks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "clicks_insert_public" ON clicks;
CREATE POLICY "clicks_insert_public" ON clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- api_keys
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

-- abuse_flags
DROP POLICY IF EXISTS "abuse_select_admin" ON abuse_flags;
CREATE POLICY "abuse_select_admin" ON abuse_flags FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_insert_admin" ON abuse_flags;
CREATE POLICY "abuse_insert_admin" ON abuse_flags FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_update_admin" ON abuse_flags;
CREATE POLICY "abuse_update_admin" ON abuse_flags FOR UPDATE
  TO authenticated USING (is_current_user_admin()) WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_delete_admin" ON abuse_flags;
CREATE POLICY "abuse_delete_admin" ON abuse_flags FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- support_tickets
DROP POLICY IF EXISTS "tickets_select_own_or_admin" ON support_tickets;
CREATE POLICY "tickets_select_own_or_admin" ON support_tickets FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR is_current_user_admin());

DROP POLICY IF EXISTS "tickets_insert_own" ON support_tickets;
CREATE POLICY "tickets_insert_own" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "tickets_insert_anon" ON support_tickets;
CREATE POLICY "tickets_insert_anon" ON support_tickets FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "tickets_update_own_or_admin" ON support_tickets;
CREATE POLICY "tickets_update_own_or_admin" ON support_tickets FOR UPDATE
  TO authenticated USING (user_id = auth.uid() OR is_current_user_admin())
  WITH CHECK (user_id = auth.uid() OR is_current_user_admin());

-- banned_users
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

-- featured_links
DROP POLICY IF EXISTS "featured_select_all" ON featured_links;
CREATE POLICY "featured_select_all" ON featured_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "featured_insert_admin" ON featured_links;
CREATE POLICY "featured_insert_admin" ON featured_links FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "featured_delete_admin" ON featured_links;
CREATE POLICY "featured_delete_admin" ON featured_links FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ip_blocks
DROP POLICY IF EXISTS "ip_blocks_select_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_select_admin" ON ip_blocks FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "ip_blocks_insert_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_insert_admin" ON ip_blocks FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "ip_blocks_delete_admin" ON ip_blocks;
CREATE POLICY "ip_blocks_delete_admin" ON ip_blocks FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- announcements
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

-- deploy_keys
DROP POLICY IF EXISTS "noop_deploy_keys" ON deploy_keys;
CREATE POLICY "noop_deploy_keys" ON deploy_keys
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- rate_limits
DROP POLICY IF EXISTS "rate_limits_service_only" ON rate_limits;
CREATE POLICY "rate_limits_service_only" ON rate_limits
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- domains
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

-- plugins
DROP POLICY IF EXISTS "select_own_plugins" ON plugins;
CREATE POLICY "select_own_plugins" ON plugins FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_plugins" ON plugins;
CREATE POLICY "insert_own_plugins" ON plugins FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_plugins" ON plugins;
CREATE POLICY "update_own_plugins" ON plugins FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_plugins" ON plugins;
CREATE POLICY "delete_own_plugins" ON plugins FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- marketplace_templates
DROP POLICY IF EXISTS "select_published_templates" ON marketplace_templates;
CREATE POLICY "select_published_templates" ON marketplace_templates FOR SELECT
  TO authenticated USING (is_published = true OR author_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_templates" ON marketplace_templates;
CREATE POLICY "insert_own_templates" ON marketplace_templates FOR INSERT
  TO authenticated WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "update_own_templates" ON marketplace_templates;
CREATE POLICY "update_own_templates" ON marketplace_templates FOR UPDATE
  TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_templates" ON marketplace_templates;
CREATE POLICY "delete_own_templates" ON marketplace_templates FOR DELETE
  TO authenticated USING (author_id = auth.uid());

-- marketplace_purchases
DROP POLICY IF EXISTS "select_own_purchases" ON marketplace_purchases;
CREATE POLICY "select_own_purchases" ON marketplace_purchases FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = marketplace_purchases.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_purchases" ON marketplace_purchases;
CREATE POLICY "insert_own_purchases" ON marketplace_purchases FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = marketplace_purchases.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_purchases" ON marketplace_purchases;
CREATE POLICY "delete_own_purchases" ON marketplace_purchases FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = marketplace_purchases.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- subscriptions
DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- workspace_quotas
DROP POLICY IF EXISTS "select_own_quotas" ON workspace_quotas;
CREATE POLICY "select_own_quotas" ON workspace_quotas FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_quotas.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_quotas" ON workspace_quotas;
CREATE POLICY "update_own_quotas" ON workspace_quotas FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_quotas.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_quotas.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- notifications
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- notification_preferences
DROP POLICY IF EXISTS "select_own_notif_prefs" ON notification_preferences;
CREATE POLICY "select_own_notif_prefs" ON notification_preferences FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_notif_prefs" ON notification_preferences;
CREATE POLICY "insert_own_notif_prefs" ON notification_preferences FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_notif_prefs" ON notification_preferences;
CREATE POLICY "update_own_notif_prefs" ON notification_preferences FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- webhooks
DROP POLICY IF EXISTS "select_own_webhooks" ON webhooks;
CREATE POLICY "select_own_webhooks" ON webhooks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_webhooks" ON webhooks;
CREATE POLICY "insert_own_webhooks" ON webhooks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_webhooks" ON webhooks;
CREATE POLICY "update_own_webhooks" ON webhooks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_webhooks" ON webhooks;
CREATE POLICY "delete_own_webhooks" ON webhooks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- webhook_deliveries
DROP POLICY IF EXISTS "select_own_deliveries" ON webhook_deliveries;
CREATE POLICY "select_own_deliveries" ON webhook_deliveries FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM webhooks
      JOIN workspace_members ON workspace_members.workspace_id = webhooks.workspace_id
      WHERE webhooks.id = webhook_deliveries.webhook_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- ============ SEED DATA ============
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============ REFRESH POSTGREST SCHEMA CACHE ============
NOTIFY pgrst, 'reload schema';
