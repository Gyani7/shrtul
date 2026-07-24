/*
# Add increment_promo_sends RPC

## Overview
Adds a SECURITY DEFINER function to atomically increment a promo URL's total_sends
counter by 1. Called by the redirect edge function when a visitor is sent to a promo URL.

## Changes
- New function `increment_promo_sends(promo_id uuid)`: increments promo_urls.total_sends by 1.
- SECURITY DEFINER for reliable service-role invocation.
*/

CREATE OR REPLACE FUNCTION increment_promo_sends(promo_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE promo_urls SET total_sends = total_sends + 1 WHERE id = promo_id;
END
$$

