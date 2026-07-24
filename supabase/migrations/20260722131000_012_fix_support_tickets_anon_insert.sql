/*
# Fix support_tickets insert for anon users

## Problem
The `tickets_insert_own` policy only allows `authenticated` role.
The contact form on the public `/contact` page posts to `/api/support`
without authentication, so unauthenticated users (anon role) cannot
submit support tickets.

## Solution
Add a separate INSERT policy for `anon` role that allows null user_id.
*/

DROP POLICY IF EXISTS "tickets_insert_own" ON support_tickets;
DROP POLICY IF EXISTS "tickets_insert_anon" ON support_tickets;

CREATE POLICY "tickets_insert_own" ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));

CREATE POLICY "tickets_insert_anon" ON support_tickets
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
