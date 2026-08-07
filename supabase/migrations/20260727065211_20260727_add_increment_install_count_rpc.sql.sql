/*
# Add increment_install_count RPC

## Summary
Adds a SECURITY DEFINER function to atomically increment the install_count column
on marketplace_templates when a purchase is made.

## Changes
1. New RPC: `increment_install_count(p_template_id uuid)` — increments install_count by 1.
   SECURITY DEFINER to bypass RLS (called from server-side code during purchase flow).
*/

CREATE OR REPLACE FUNCTION increment_install_count(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE marketplace_templates
  SET install_count = install_count + 1
  WHERE id = p_template_id;
END;
$$;
