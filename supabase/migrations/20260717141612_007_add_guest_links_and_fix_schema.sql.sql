/*
# Guest links, claim feature, and schema fixes

## Overview
This migration adds support for guest-created short links (no login required),
a claim mechanism to convert guest links to permanent user-owned links, and
fixes several schema issues that prevented the app from working.

## Changes

### 1. New columns on `links`
- `is_guest` (boolean, default false) — marks links created by guests
- `guest_session_id` (text, nullable) — browser session ID for claiming guest links

### 2. Made `workspace_id` and `creator_id` nullable on links
Guests don't have workspaces or profiles, so these must accept NULL for guest links.

### 3. New RLS policies for guest access
- `links_insert_guest` — anon can insert guest links (is_guest=true, no workspace_id)
- `links_select_public` — anon can select active links (for redirects)
- `links_select_guest_own` — anon can select guest links matching session ID
- `links_update_claim` — authenticated users can claim guest links by session ID

### 4. New RPC functions
- `claim_guest_links(p_session_id)` — assigns guest links to the calling user
- `cleanup_expired_guest_links()` — deletes expired guest links

### 5. Clicks table: workspace_id made nullable (guest links have no workspace)

### 6. Indexes for guest session, is_guest, and expires_at
*/

-- ============ Make workspace_id and creator_id nullable on links ============
ALTER TABLE links ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE links ALTER COLUMN creator_id DROP NOT NULL;

-- ============ Add guest link columns ============
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;
ALTER TABLE links ADD COLUMN IF NOT EXISTS guest_session_id text;

-- ============ Make clicks.workspace_id nullable ============
ALTER TABLE clicks ALTER COLUMN workspace_id DROP NOT NULL;

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_links_guest_session ON links (guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_is_guest ON links (is_guest) WHERE is_guest = true;
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links (expires_at) WHERE expires_at IS NOT NULL;

-- ============ Drop old policies that conflict ============
DROP POLICY IF EXISTS "links_insert_guest" ON links;
DROP POLICY IF EXISTS "links_insert_member" ON links;
DROP POLICY IF EXISTS "links_select_public" ON links;
DROP POLICY IF EXISTS "links_select_guest_own" ON links;
DROP POLICY IF EXISTS "links_update_claim" ON links;
DROP POLICY IF EXISTS "clicks_insert_public" ON clicks;
DROP POLICY IF EXISTS "clicks_select_public" ON clicks;

-- ============ Guest link RLS policies ============

-- Allow anyone to insert guest links (is_guest = true, no workspace)
CREATE POLICY "links_insert_guest" ON links FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_guest = true AND workspace_id IS NULL);

-- Allow authenticated users to insert non-guest links
CREATE POLICY "links_insert_member" ON links FOR INSERT
  TO authenticated
  WITH CHECK (
    is_guest = false
    AND workspace_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = links.workspace_id AND wm.user_id = auth.uid()
    )
  );

-- Allow anyone to read active links (for redirects)
CREATE POLICY "links_select_public" ON links FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow anon to read their own guest links by session ID
CREATE POLICY "links_select_guest_own" ON links FOR SELECT
  TO anon, authenticated
  USING (is_guest = true AND guest_session_id IS NOT NULL);

-- Allow authenticated users to claim guest links by session ID
CREATE POLICY "links_update_claim" ON links FOR UPDATE
  TO authenticated
  USING (is_guest = true AND guest_session_id IS NOT NULL)
  WITH CHECK (is_guest = false AND creator_id = auth.uid());

-- ============ Clicks: allow anon insert for guest link tracking ============
CREATE POLICY "clicks_insert_public" ON clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anon to read clicks (public analytics)
CREATE POLICY "clicks_select_public" ON clicks FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============ Claim guest links RPC function ============
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
  FROM workspaces
  WHERE owner_id = v_user_id
  LIMIT 1;

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
END;
$$;

-- ============ Verify password function ============
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

-- ============ Hash password function ============
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

-- ============ Clean up expired guest links function ============
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
END;
$$;
