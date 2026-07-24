/*
# Fix remaining RLS recursion on 5 tables

## Problem
14 policies across 5 tables (announcements, banned_users, featured_links, ip_blocks,
support_tickets) still use the old pattern:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)

This causes infinite RLS recursion because querying `profiles` inside a policy
on another table triggers the `profiles_select_own` policy, which in turn may
re-evaluate the calling policy.

## Solution
Replace all `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)`
with the `is_current_user_admin()` SECURITY DEFINER function (created in migration 009)
that bypasses RLS entirely.

## Tables affected
1. announcements — 3 policies (delete, insert, update)
2. banned_users — 4 policies (delete, insert, select, update)
3. featured_links — 2 policies (delete, insert)
4. ip_blocks — 3 policies (delete, insert, select)
5. support_tickets — 2 policies (select, update)

## Additional fix
Add missing `profiles_delete_own` policy so users can delete their own profile.
*/

-- === announcements ===
DROP POLICY IF EXISTS "announcements_delete_admin" ON announcements;
DROP POLICY IF EXISTS "announcements_insert_admin" ON announcements;
DROP POLICY IF EXISTS "announcements_update_admin" ON announcements;

CREATE POLICY "announcements_delete_admin" ON announcements
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "announcements_insert_admin" ON announcements
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "announcements_update_admin" ON announcements
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- === banned_users ===
DROP POLICY IF EXISTS "banned_users_delete_admin" ON banned_users;
DROP POLICY IF EXISTS "banned_users_insert_admin" ON banned_users;
DROP POLICY IF EXISTS "banned_users_select_admin" ON banned_users;
DROP POLICY IF EXISTS "banned_users_update_admin" ON banned_users;

CREATE POLICY "banned_users_select_admin" ON banned_users
  FOR SELECT TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "banned_users_insert_admin" ON banned_users
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "banned_users_update_admin" ON banned_users
  FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "banned_users_delete_admin" ON banned_users
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- === featured_links ===
DROP POLICY IF EXISTS "featured_delete_admin" ON featured_links;
DROP POLICY IF EXISTS "featured_insert_admin" ON featured_links;

CREATE POLICY "featured_insert_admin" ON featured_links
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "featured_delete_admin" ON featured_links
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- === ip_blocks ===
DROP POLICY IF EXISTS "ip_blocks_delete_admin" ON ip_blocks;
DROP POLICY IF EXISTS "ip_blocks_insert_admin" ON ip_blocks;
DROP POLICY IF EXISTS "ip_blocks_select_admin" ON ip_blocks;

CREATE POLICY "ip_blocks_select_admin" ON ip_blocks
  FOR SELECT TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "ip_blocks_insert_admin" ON ip_blocks
  FOR INSERT TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "ip_blocks_delete_admin" ON ip_blocks
  FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- === support_tickets ===
DROP POLICY IF EXISTS "tickets_select_own_or_admin" ON support_tickets;
DROP POLICY IF EXISTS "tickets_update_own_or_admin" ON support_tickets;

CREATE POLICY "tickets_select_own_or_admin" ON support_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_current_user_admin());

CREATE POLICY "tickets_update_own_or_admin" ON support_tickets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_current_user_admin())
  WITH CHECK (user_id = auth.uid() OR is_current_user_admin());

-- === profiles: add missing delete policy ===
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);
