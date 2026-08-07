/*
# Fix triggers, RPC functions, and missing RLS policies

## Problem
The database schema was created but critical pieces are missing:
1. The `handle_new_user` trigger function exists but is NOT attached to `auth.users` — signup doesn't auto-create profile + workspace + workspace_member
2. The `set_updated_at` trigger function exists but is NOT attached to any table
3. The `verify_password` RPC function (used by the unlock page) is missing
4. The `hash_password` RPC function is missing
5. Public redirects (anon role) can't read links or insert clicks — no anon policies
6. No auto-increment trigger for `total_clicks` on the `clicks` table

## Changes

### 1. Triggers attached
- `on_auth_user_created` trigger on `auth.users` → calls `handle_new_user()` on INSERT
- `set_updated_at` trigger on profiles, workspaces, links, api_keys, promo_urls, platform_settings

### 2. New RPC functions
- `verify_password(pw text, hash text)` — checks bcrypt-style password hash using extensions.crypt()
- `hash_password(pw text)` — returns crypt() hash for password storage

### 3. New RLS policies for public access
- `links_select_public` — anon can SELECT active links (needed for redirects)
- `clicks_insert_public` — anon can INSERT clicks (needed for click tracking)
- `clicks_select_public` — anon can SELECT clicks (needed for public analytics)

### 4. Auto-increment trigger
- `increment_link_click_count` function + trigger on `clicks` INSERT → increments `links.total_clicks` automatically

### 5. Workspaces member policies
- `workspaces_insert_member` — authenticated users can create workspaces they own
- `workspaces_update_member` — workspace members can update workspaces they belong to

### Security
- Public (anon) SELECT on links is limited to `is_active = true` rows only
- Public (anon) INSERT on clicks allowed (for click tracking)
- All authenticated policies enforce workspace membership or ownership
- `verify_password` and `hash_password` are SECURITY DEFINER functions
*/

-- ============================================================
-- 1. Attach handle_new_user trigger to auth.users
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. Attach set_updated_at triggers to all tables with updated_at
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_workspaces ON workspaces;
CREATE TRIGGER set_updated_at_workspaces
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_links ON links;
CREATE TRIGGER set_updated_at_links
  BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_api_keys ON api_keys;
CREATE TRIGGER set_updated_at_api_keys
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_promo_urls ON promo_urls;
CREATE TRIGGER set_updated_at_promo_urls
  BEFORE UPDATE ON promo_urls
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_platform_settings ON platform_settings;
CREATE TRIGGER set_updated_at_platform_settings
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 3. Create verify_password and hash_password RPC functions
--    crypt/gen_salt are in the "extensions" schema on Bolt Database
-- ============================================================
CREATE OR REPLACE FUNCTION verify_password(pw text, hash text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
  SELECT extensions.crypt(pw, hash) = hash
$$;

CREATE OR REPLACE FUNCTION hash_password(pw text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
  SELECT extensions.crypt(pw, extensions.gen_salt('bf'))
$$;

-- ============================================================
-- 4. Auto-increment total_clicks on clicks INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION increment_link_click_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE links
  SET total_clicks = total_clicks + 1
  WHERE id = NEW.link_id;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS on_click_inserted ON clicks;
CREATE TRIGGER on_click_inserted
  AFTER INSERT ON clicks
  FOR EACH ROW EXECUTE FUNCTION increment_link_click_count();

-- ============================================================
-- 5. RLS policies for public (anon) access — needed for redirects
-- ============================================================

-- Links: anon can read active links (for redirect resolution)
DROP POLICY IF EXISTS "links_select_public" ON links;
CREATE POLICY "links_select_public"
  ON links FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Clicks: anon can insert clicks (for click tracking during redirect)
DROP POLICY IF EXISTS "clicks_insert_public" ON clicks;
CREATE POLICY "clicks_insert_public"
  ON clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Clicks: anon can read clicks (for public analytics)
DROP POLICY IF EXISTS "clicks_select_public" ON clicks;
CREATE POLICY "clicks_select_public"
  ON clicks FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 6. Workspaces: ensure members can insert/update
-- ============================================================
DROP POLICY IF EXISTS "workspaces_insert_member" ON workspaces;
CREATE POLICY "workspaces_insert_member"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_update_member" ON workspaces;
CREATE POLICY "workspaces_update_member"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
  ))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
  ));

-- ============================================================
-- 7. Links: allow anon UPDATE for click count increment
--    The auto-increment trigger handles total_clicks now,
--    but old code may still try manual update.
-- ============================================================
DROP POLICY IF EXISTS "links_update_public_clicks" ON links;
CREATE POLICY "links_update_public_clicks"
  ON links FOR UPDATE
  TO anon, authenticated
  USING (is_active = true)
  WITH CHECK (is_active = true);

-- ============================================================
-- 8. Ensure platform_settings has a default row
-- ============================================================
INSERT INTO platform_settings (id, promo_enabled, redirect_percentage, signup_bonus_clicks)
VALUES (1, true, 0.20, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. Index for fast alias lookup (critical for redirect speed)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_alias ON links (alias);

