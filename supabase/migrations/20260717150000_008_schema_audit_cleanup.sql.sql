/*
# 008: Schema audit cleanup, fix duplicates, refresh cache, add domains table

## Problems found during audit:
1. Duplicate `set_updated_at` triggers on multiple tables (different names, same function)
2. `links_update_public_clicks` policy allows anon to UPDATE links — security risk
3. No `domains` table (referenced in task requirements)
4. Schema cache may be stale after previous migrations
5. Need backfill function for users without workspaces

## Changes:
1. Drop duplicate triggers, keep one per table
2. Drop insecure `links_update_public_clicks` policy
3. Create `domains` table for custom domain management
4. Add `ensure_user_workspace()` function for backfilling
5. Refresh PostgREST schema cache via `NOTIFY pgrst, 'reload schema'`
*/

-- ============ Drop duplicate triggers ============

DROP TRIGGER IF EXISTS set_updated_at_links ON links;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_workspaces ON workspaces;
DROP TRIGGER IF EXISTS set_updated_at_api_keys ON api_keys;
DROP TRIGGER IF EXISTS set_updated_at_platform_settings ON platform_settings;
DROP TRIGGER IF EXISTS set_updated_at_promo_urls ON promo_urls;

-- ============ Drop insecure policy ============
DROP POLICY IF EXISTS "links_update_public_clicks" ON links;

-- ============ Create domains table ============
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  is_verified boolean NOT NULL DEFAULT false,
  is_primary boolean NOT NULL DEFAULT false,
  verification_token text,
  ssl_status text NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending','active','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "domains_select_member" ON domains;
CREATE POLICY "domains_select_member" ON domains FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "domains_insert_member" ON domains;
CREATE POLICY "domains_insert_member" ON domains FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "domains_update_member" ON domains;
CREATE POLICY "domains_update_member" ON domains FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "domains_delete_member" ON domains;
CREATE POLICY "domains_delete_member" ON domains FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = domains.workspace_id AND wm.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_domains_workspace ON domains (workspace_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains (domain);

DROP TRIGGER IF EXISTS domains_set_updated_at ON domains;
CREATE TRIGGER domains_set_updated_at BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ ensure_user_workspace function ============
CREATE OR REPLACE FUNCTION ensure_user_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- ============ Backfill workspaces for existing users without one ============
DO $$
DECLARE
  u RECORD;
  v_ws_id uuid;
  v_slug text;
BEGIN
  FOR u IN
    SELECT au.id, au.email
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM workspaces w WHERE w.owner_id = au.id)
  LOOP
    v_slug := 'ws-' || left(encode(gen_random_bytes(6), 'hex'), 6);
    INSERT INTO workspaces (name, slug, owner_id)
    VALUES (COALESCE(split_part(u.email, '@', 1), 'my-workspace'), v_slug, u.id)
    RETURNING id INTO v_ws_id;

    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (v_ws_id, u.id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    INSERT INTO profiles (id, email)
    VALUES (u.id, COALESCE(u.email, ''))
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- ============ Refresh PostgREST schema cache ============
NOTIFY pgrst, 'reload schema';
