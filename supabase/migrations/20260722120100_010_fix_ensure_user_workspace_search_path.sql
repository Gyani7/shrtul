/*
# Fix ensure_user_workspace search_path

## Problem
The `ensure_user_workspace` function did not include `extensions` in its
`search_path`, causing `gen_random_bytes` to not be found when called from
RLS-protected contexts.

## Solution
Recreate the function with `SET search_path = public, extensions`.
*/

CREATE OR REPLACE FUNCTION ensure_user_workspace()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  ws_id uuid;
BEGIN
  SELECT id INTO ws_id FROM workspaces WHERE owner_id = auth.uid() LIMIT 1;
  IF ws_id IS NULL THEN
    INSERT INTO workspaces (owner_id, name)
    VALUES (auth.uid(), 'My Workspace')
    RETURNING id INTO ws_id;
  END IF;
END;
$$;
