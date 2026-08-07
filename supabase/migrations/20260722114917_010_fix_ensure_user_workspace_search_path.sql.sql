/*
# 010: Fix ensure_user_workspace search_path
The function uses gen_random_bytes which lives in the extensions schema,
but the function's search_path only includes public. Fix to include extensions.
*/
CREATE OR REPLACE FUNCTION ensure_user_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_slug text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_workspace_id
  FROM workspaces
  WHERE owner_id = v_user_id
  LIMIT 1;

  IF v_workspace_id IS NOT NULL THEN
    RETURN v_workspace_id;
  END IF;

  v_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);

  INSERT INTO workspaces (name, slug, owner_id)
  VALUES ('My Workspace', v_slug, v_user_id)
  RETURNING id INTO v_workspace_id;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, v_user_id, 'owner')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RETURN v_workspace_id;
END;
$$;
