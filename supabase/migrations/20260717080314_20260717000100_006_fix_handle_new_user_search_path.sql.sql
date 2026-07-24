/*
# Fix handle_new_user function search_path

## Problem
The `handle_new_user` trigger function uses `gen_random_bytes()` and `encode()`
from the pgcrypto extension, which lives in the `extensions` schema on Bolt Database.
The function's search_path only included `public`, so every signup triggered
a "function gen_random_bytes(integer) does not exist" error — causing the
entire trigger to fail and NO profile, workspace, or workspace_member to be
created. This was the root cause of "No workspace found" on link creation.

## Fix
Recreate `handle_new_user` with `SET search_path = extensions, public` so
pgcrypto functions resolve correctly. Also use `extensions.gen_random_bytes`
explicitly for safety.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
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

  ws_slug := 'ws-' || left(encode(extensions.gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (
    COALESCE(split_part(NEW.email, '@', 1), 'my-workspace'),
    ws_slug,
    NEW.id
  )
  RETURNING id INTO ws_id;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, NEW.id, 'owner');

  RETURN NEW;
END
$$

