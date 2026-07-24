import { createAuthenticatedClient } from '@/lib/supabase-server';
import { DashboardShell } from '@/components/dashboard-shell';
import { AuthError } from '@/components/auth-error';
import type { Profile } from '@/lib/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { client: supabase, user, error: authError } = await createAuthenticatedClient();

  if (authError || !user) {
    console.error('[dashboard/layout] auth failed:', authError);
    return <AuthError message="Session expired. Please refresh the page to sign in again." />;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[dashboard/layout] profiles select error:', error.code, error.message, error.details);
    return <AuthError message={`Unable to load your profile: ${error.message}`} />;
  }

  if (!profile) {
    console.error('[dashboard/layout] no profile row for user:', user.id);
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: '',
        avatar_url: '',
      })
      .select('*')
      .maybeSingle();

    if (insertError) {
      console.error('[dashboard/layout] profile auto-create error:', insertError.code, insertError.message, insertError.details);
      return <AuthError message={`Profile not found and auto-create failed: ${insertError.message}`} />;
    }

    if (!created) {
      return <AuthError message="Profile not found and auto-create returned no data." />;
    }

    await supabase.rpc('ensure_user_workspace');

    return (
      <DashboardShell profile={created as Profile} email={user.email}>
        {children}
      </DashboardShell>
    );
  }

  await supabase.rpc('ensure_user_workspace');

  return (
    <DashboardShell profile={profile as Profile} email={user.email}>
      {children}
    </DashboardShell>
  );
}
