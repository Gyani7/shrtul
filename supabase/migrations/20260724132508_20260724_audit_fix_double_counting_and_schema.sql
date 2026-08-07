/*
# Fix Double-Counting Bug and Add Missing Platform Settings Columns

## 1. Double-Counting Fix
The `on_click_inserted` trigger on the `clicks` table calls `increment_link_click_count()`
which increments `links.total_clicks` by 1. The application code ALSO calls the
`increment_link_counters()` RPC which increments `total_clicks` by 1 again.
This causes every click to increment `total_clicks` by 2.

**Fix:** Drop the `on_click_inserted` trigger. The `increment_link_counters()` RPC
is the canonical way to update counters — it also handles `promo_clicks`.

## 2. Platform Settings Columns
The `platform_settings` table is missing columns that the application code reads
and writes: `maintenance_mode`, `maintenance_message`, `max_redirect_percentage`,
`site_name`, `site_description`, `seo_keywords`, `donation_url`, `coffee_url`.

These columns were referenced in the TypeScript types and admin settings API but
never added to the actual database schema. This migration adds them.

## 3. Clicks: Add defaults for is_unique
The `clicks.is_unique` column has no default. Set it to `false` so inserts that
omit it don't fail.
*/

-- 1. Drop the double-counting trigger
DROP TRIGGER IF EXISTS on_click_inserted ON clicks;
DROP FUNCTION IF EXISTS increment_link_click_count();

-- 2. Add missing platform_settings columns
ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS maintenance_message text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS max_redirect_percentage integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Shrtul',
  ADD COLUMN IF NOT EXISTS site_description text NOT NULL DEFAULT 'Fast, free, and reliable URL shortener',
  ADD COLUMN IF NOT EXISTS seo_keywords text NOT NULL DEFAULT 'url shortener, short link, link shortener',
  ADD COLUMN IF NOT EXISTS donation_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS coffee_url text NOT NULL DEFAULT '';

-- 3. Set default for clicks.is_unique
ALTER TABLE clicks
  ALTER COLUMN is_unique SET DEFAULT false;
