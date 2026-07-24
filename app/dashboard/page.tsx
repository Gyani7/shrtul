import { createAuthenticatedClient } from '@/lib/supabase-server';
import { DashboardOverview } from '@/components/dashboard-overview';
import { AuthError } from '@/components/auth-error';
import type { Link } from '@/lib/types';

export default async function DashboardPage() {
  const { client: supabase, user, error: authError } = await createAuthenticatedClient();

  if (authError || !user) {
    console.error('[dashboard/page] auth failed:', authError);
    return <AuthError message="Unable to load dashboard. Please refresh the page." />;
  }

  const { data, error } = await supabase
    .from('links')
    .select('id, alias, original_url, title, total_clicks, created_at, is_active, is_guest, expires_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[dashboard/page] links select error:', error.code, error.message, error.details);
    return <AuthError message={`Unable to load your links: ${error.message}`} />;
  }

  const links = (data || []) as unknown as Link[];

  const { count: totalLinks, error: countError } = await supabase
    .from('links')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', user.id);

  if (countError) {
    console.error('[dashboard/page] links count error:', countError.code, countError.message);
  }

  const { data: clicksData, error: clicksError } = await supabase
    .from('clicks')
    .select('link_id')
    .in('link_id', links.map(l => l.id));

  if (clicksError) {
    console.error('[dashboard/page] clicks select error:', clicksError.code, clicksError.message);
  }

  const totalClicks = clicksData?.length || 0;

  return <DashboardOverview links={links} totalLinks={totalLinks || 0} totalClicks={totalClicks} />;
}
