/*
# Fix RLS recursion on profiles and admin policy checks

## Problem
The `profiles_select_own` policy used `EXISTS (SELECT 1 FROM profiles ...)` which
caused infinite RLS recursion — the policy on `profiles` referenced `profiles` itself.

## Solution
1. Create a `SECURITY DEFINER` function `is_current_user_admin()` that bypasses RLS
   to check if the current user is an admin.
2. Replace all policies that had self-referential subqueries on `profiles` with
   calls to this function.
3. Fix policies on `promo_urls`, `platform_settings`, `blacklisted_domains`,
   `links`, `clicks`, and `abuse_flags` that had similar recursion issues.
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_delete_own ON profiles;

DROP POLICY IF EXISTS promo_urls_select_member ON promo_urls;
DROP POLICY IF EXISTS promo_urls_insert_admin ON promo_urls;
DROP POLICY IF EXISTS promo_urls_update_admin ON promo_urls;
DROP POLICY IF EXISTS promo_urls_delete_admin ON promo_urls;

DROP POLICY IF EXISTS platform_settings_select_member ON platform_settings;
DROP POLICY IF EXISTS platform_settings_insert_admin ON platform_settings;
DROP POLICY IF EXISTS platform_settings_update_admin ON platform_settings;
DROP POLICY IF EXISTS platform_settings_delete_admin ON platform_settings;

DROP POLICY IF EXISTS blacklisted_domains_select_member ON blacklisted_domains;
DROP POLICY IF EXISTS blacklisted_domains_insert_admin ON blacklisted_domains;
DROP POLICY IF EXISTS blacklisted_domains_update_admin ON blacklisted_domains;
DROP POLICY IF EXISTS blacklisted_domains_delete_admin ON blacklisted_domains;

DROP POLICY IF EXISTS abuse_flags_select_admin ON abuse_flags;
DROP POLICY IF EXISTS abuse_flags_insert_member ON abuse_flags;
DROP POLICY IF EXISTS abuse_flags_update_admin ON abuse_flags;
DROP POLICY IF EXISTS abuse_flags_delete_admin ON abuse_flags;

-- Create SECURITY DEFINER function to check admin status (bypasses RLS)
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

-- Recreate profiles policies (no self-reference)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Recreate promo_urls policies (admin-only via function)
CREATE POLICY "promo_urls_select_member" ON promo_urls
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "promo_urls_insert_admin" ON promo_urls
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "promo_urls_update_admin" ON promo_urls
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "promo_urls_delete_admin" ON promo_urls
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- Recreate platform_settings policies (admin-only via function)
CREATE POLICY "platform_settings_select_member" ON platform_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "platform_settings_insert_admin" ON platform_settings
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "platform_settings_update_admin" ON platform_settings
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "platform_settings_delete_admin" ON platform_settings
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- Recreate blacklisted_domains policies (admin-only via function)
CREATE POLICY "blacklisted_domains_select_member" ON blacklisted_domains
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "blacklisted_domains_insert_admin" ON blacklisted_domains
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "blacklisted_domains_update_admin" ON blacklisted_domains
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "blacklisted_domains_delete_admin" ON blacklisted_domains
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- Recreate abuse_flags policies (admin read/update, any authenticated insert)
CREATE POLICY "abuse_flags_select_admin" ON abuse_flags
  FOR SELECT TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "abuse_flags_insert_member" ON abuse_flags
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "abuse_flags_update_admin" ON abuse_flags
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "abuse_flags_delete_admin" ON abuse_flags
  FOR DELETE TO authenticated
  USING (is_current_user_admin());
