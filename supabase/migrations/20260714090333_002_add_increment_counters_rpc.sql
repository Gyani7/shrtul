/*
# Add increment_link_counters RPC

## Overview
Adds a SECURITY DEFINER function to atomically increment a link's total_clicks
(and promo_clicks when the click was a promo redirect). The redirect edge function
calls this to keep counters consistent without a race condition.

## Changes
- New function `increment_link_counters(link_id_input uuid, is_promo boolean)`:
  increments links.total_clicks by 1; if is_promo is true, also increments
  links.promo_clicks by 1.
- SECURITY DEFINER so the edge function (service role) can call it reliably.

## Notes
- Idempotent per call (each call = one click). Safe to re-run.
- No RLS impact (function-level security).
*/

CREATE OR REPLACE FUNCTION increment_link_counters(link_id_input uuid, is_promo boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE links
  SET total_clicks = total_clicks + 1,
      promo_clicks = promo_clicks + (CASE WHEN is_promo THEN 1 ELSE 0 END)
  WHERE id = link_id_input;
END
$$

