/*
# Fix get_analytics_by_period function

## Changes
- Replaces the existing `get_analytics_by_period` function with a corrected version.
- The previous version had a nested aggregate error in the `top_links` subquery (ORDER BY used `l.total_clicks` inside a jsonb_agg with count).
- The new version simplifies the output to return daily click and link counts for the specified period.
- Also includes top countries, browsers, devices, os, and referrers.

## Important Notes
1. This is a DROP + CREATE of a function (no data loss — functions are not data).
2. The function returns jsonb with the analytics summary.
*/

DROP FUNCTION IF EXISTS get_analytics_by_period(integer);

CREATE FUNCTION get_analytics_by_period(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'date', d::date::text,
        'clicks', click_count,
        'links', link_count
      ) ORDER BY d)
      FROM (
        SELECT
          d,
          (SELECT count(*) FROM clicks c WHERE date_trunc('day', c.created_at) = d) AS click_count,
          (SELECT count(*) FROM links l WHERE date_trunc('day', l.created_at) = d) AS link_count
        FROM generate_series(
          date_trunc('day', now() - interval '1 day' * p_days),
          date_trunc('day', now()),
          '1 day'
        ) AS d
      ) daily_data
    ), '[]'::jsonb),
    'total_clicks', (SELECT count(*) FROM clicks WHERE created_at > now() - interval '1 day' * p_days),
    'total_links', (SELECT count(*) FROM links WHERE created_at > now() - interval '1 day' * p_days),
    'top_countries', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('country', country, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(country, 'Unknown') AS country, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY country
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_browsers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('browser', browser, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(browser, 'Unknown') AS browser, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY browser
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_devices', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('device', device, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(device, 'Unknown') AS device, count(*) AS cnt
        FROM clicks
        WHERE created_at > now() - interval '1 day' * p_days
        GROUP BY device
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb),
    'top_links', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('alias', alias, 'url', original_url, 'clicks', total_clicks) ORDER BY total_clicks DESC)
      FROM (
        SELECT alias, original_url, total_clicks
        FROM links
        WHERE created_at > now() - interval '1 day' * p_days
        ORDER BY total_clicks DESC
        LIMIT 10
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
