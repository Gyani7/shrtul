import { createAuthenticatedClient } from '@/lib/supabase-server';
import { LinksManager } from '@/components/links-manager';
import { AuthError } from '@/components/auth-error';
import type { Link } from '@/lib/types';

export default async function LinksPage() {
  const { client: supabase, user, error: authError } = await createAuthenticatedClient();

  if (authError || !user) {
    console.error('[dashboard/links] auth failed:', authError);
    return <AuthError message="Unable to load links. Please refresh the page." />;
  }

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[dashboard/links] links select error:', error.code, error.message, error.details);
    return <AuthError message={`Unable to load your links: ${error.message}`} />;
  }

  const links = (data || []) as unknown as Link[];

  return <LinksManager initialLinks={links} />;
}
