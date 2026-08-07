
/*
# Add email column to profiles

## Overview
Adds an `email` text column to the `profiles` table and populates it from
`auth.users.email` in the new-user trigger. The frontend shows member emails
in workspaces and the admin user list, which requires the email to be available
through RLS-scoped reads (auth.users is not readable by the anon client).

## Changes
- New column `profiles.email` (text, not null default '').
- Updated `handle_new_user()` trigger to insert the email from `NEW.email`.
- Backfilled existing profiles with their auth.users email.

## Security
- No policy changes. The email is the user's own auth email, visible via their
  own profile row and to admins (existing policies already cover this).
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';

UPDATE profiles p
SET email = COALESCE((SELECT email FROM auth.users u WHERE u.id = p.id), '')
WHERE p.email = '';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ws_id uuid;
  ws_slug text;
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''), COALESCE(NEW.email, ''));

  ws_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (COALESCE(split_part(NEW.email, '@', 1), 'my-workspace'), ws_slug, NEW.id)
  RETURNING id INTO ws_id;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, NEW.id, 'owner');

  RETURN NEW;
END
$$
