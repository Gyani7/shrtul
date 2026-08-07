/*
# 009: Fix RLS infinite recursion on profiles table

## Root cause
The `profiles_select_own` RLS policy contains a subquery:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
Since RLS is enabled on profiles, this subquery triggers the same SELECT policy
recursively, causing infinite recursion. PostgreSQL returns an error instead
of results, which the dashboard showed as a generic "Unable to load your profile".

The same self-referencing pattern appears in policies on promo_urls,
platform_settings, blacklisted_domains, links, clicks, and abuse_flags.

## Fix
1. Create a SECURITY DEFINER function `is_current_user_admin()` that bypasses
   RLS to check admin status — no recursion.
2. Replace every `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)`
   with `is_current_user_admin()` across all policies.
3. Simplify `profiles_select_own` to just `auth.uid() = id` (admins read all
   profiles via the admin API which uses the service role key, bypassing RLS).
*/

-- ============ SECURITY DEFINER helper: check admin without RLS recursion ============
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- ============ profiles: fix recursion ============
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ promo_urls: replace self-referencing subquery ============
DROP POLICY IF EXISTS "promo_insert_admin" ON promo_urls;
CREATE POLICY "promo_insert_admin" ON promo_urls
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "promo_update_admin" ON promo_urls;
CREATE POLICY "promo_update_admin" ON promo_urls
  FOR UPDATE TO authenticated USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "promo_delete_admin" ON promo_urls;
CREATE POLICY "promo_delete_admin" ON promo_urls
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- ============ platform_settings: replace self-referencing subquery ============
DROP POLICY IF EXISTS "settings_update_admin" ON platform_settings;
CREATE POLICY "settings_update_admin" ON platform_settings
  FOR UPDATE TO authenticated USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- ============ blacklisted_domains: replace self-referencing subquery ============
DROP POLICY IF EXISTS "blacklist_insert_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_insert_admin" ON blacklisted_domains
  FOR INSERT TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "blacklist_delete_admin" ON blacklisted_domains;
CREATE POLICY "blacklist_delete_admin" ON blacklisted_domains
  FOR DELETE TO authenticated USING (is_current_user_admin());

-- ============ links: replace self-referencing subquery in select ============
DROP POLICY IF EXISTS "links_select_member" ON links;
CREATE POLICY "links_select_member" ON links FOR SELECT
  TO authenticated USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid())
    OR is_current_user_admin()
  );

-- ============ clicks: replace self-referencing subquery ============
DROP POLICY IF EXISTS "clicks_select_member" ON clicks;
CREATE POLICY "clicks_select_member" ON clicks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = clicks.workspace_id AND wm.user_id = auth.uid())
    OR is_current_user_admin()
  );

-- ============ abuse_flags: replace self-referencing subquery ============
DROP POLICY IF EXISTS "abuse_select_admin" ON abuse_flags;
CREATE POLICY "abuse_select_admin" ON abuse_flags FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_insert_admin" ON abuse_flags;
CREATE POLICY "abuse_insert_admin" ON abuse_flags FOR INSERT
  TO authenticated WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_update_admin" ON abuse_flags;
CREATE POLICY "abuse_update_admin" ON abuse_flags FOR UPDATE
  TO authenticated USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

DROP POLICY IF EXISTS "abuse_delete_admin" ON abuse_flags;
CREATE POLICY "abuse_delete_admin" ON abuse_flags FOR DELETE
  TO authenticated USING (is_current_user_admin());

-- ============ Refresh schema cache ============
NOTIFY pgrst, 'reload schema';
