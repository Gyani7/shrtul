import { createAuthenticatedClient } from '@/lib/supabase-server';
import { AnalyticsView } from '@/components/analytics-view';
import { AuthError } from '@/components/auth-error';
import type { Link } from '@/lib/types';

export default async function AnalyticsPage() {
  const { client: supabase, user, error: authError } = await createAuthenticatedClient();

  if (authError || !user) {
    console.error('[dashboard/analytics] auth failed:', authError);
    return <AuthError message="Unable to load analytics. Please refresh the page." />;
  }

  const { data, error } = await supabase
    .from('links')
    .select('id, alias, original_url, title, total_clicks')
    .eq('creator_id', user.id)
    .order('total_clicks', { ascending: false });

  if (error) {
    console.error('[dashboard/analytics] links select error:', error.code, error.message, error.details);
    return <AuthError message={`Unable to load analytics data: ${error.message}`} />;
  }

  const links = (data || []) as unknown as Link[];

  const linkIds = links.map(l => l.id);
  let allClicks: { created_at: string; country: string; browser: string; device: string; os: string; referer: string }[] = [];

  if (linkIds.length > 0) {
    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('created_at, country, browser, device, os, referer')
      .in('link_id', linkIds)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (clicksError) {
      console.error('[dashboard/analytics] clicks select error:', clicksError.code, clicksError.message, clicksError.details);
      return <AuthError message={`Unable to load click data: ${clicksError.message}`} />;
    }
    allClicks = clicks || [];
  }

  return <AnalyticsView links={links} clicks={allClicks} />;
}
