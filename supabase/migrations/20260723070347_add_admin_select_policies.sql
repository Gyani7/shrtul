/*
# Add admin SELECT policies for profiles and promo_urls

## Problem
The admin panel uses the anon-key SSR client (createRouteClient) with cookie-based auth.
RLS policies on `profiles` only allow `auth.uid() = id` (own row), so admin users
cannot list ALL users via the admin API. Similarly, `promo_urls` SELECT only allows
`is_active = true`, so admin can't see inactive promo URLs.

## Fix
Add admin SELECT policies:
1. `profiles_select_admin` - allows admin to SELECT all profiles
2. `promo_urls_select_admin` - allows admin to SELECT all promo URLs (including inactive)

These are additive (OR) policies — the existing own-row policies remain intact.
*/

DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT
  TO authenticated USING (is_current_user_admin());

DROP POLICY IF EXISTS "promo_urls_select_admin" ON promo_urls;
CREATE POLICY "promo_urls_select_admin" ON promo_urls FOR SELECT
  TO authenticated USING (is_current_user_admin());
