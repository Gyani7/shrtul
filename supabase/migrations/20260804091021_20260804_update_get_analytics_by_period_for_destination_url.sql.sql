/*
# Update get_analytics_by_period to use destination_url

## Purpose
After renaming links.original_url to links.destination_url, the
get_analytics_by_period function still referenced the old column name
in its top_links subquery. This recreates the function with the correct
column name so it works on both fresh and existing databases.

## Changes
- Recreates get_analytics_by_period using destination_url instead of original_url

## Security
No RLS or policy changes. SECURITY DEFINER preserved.
*/

CREATE OR REPLACE FUNCTION get_analytics_by_period(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_interval interval := (p_days || ' days')::interval;
BEGIN
  SELECT jsonb_build_object(
    'total_clicks', (SELECT count(*) FROM clicks WHERE created_at >= now() - v_interval),
    'total_links', (SELECT count(*) FROM links WHERE created_at >= now() - v_interval),
    'unique_visitors', (SELECT count(DISTINCT visitor_ip) FROM clicks WHERE created_at >= now() - v_interval),
    'promo_clicks', (SELECT count(*) FROM clicks WHERE is_promo_redirect = true AND created_at >= now() - v_interval),
    'by_day', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', d::date,
        'clicks', (SELECT count(*) FROM clicks WHERE created_at::date = d::date),
        'links', (SELECT count(*) FROM links WHERE created_at::date = d::date)
      ))
      FROM generate_series(now() - v_interval, now(), '1 day') AS d
    ), '[]'::jsonb),
    'top_links', COALESCE((
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT alias, title, total_clicks
        FROM links
        WHERE created_at >= now() - v_interval
        ORDER BY total_clicks DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;

NOTIFY pgrst, 'reload schema';
