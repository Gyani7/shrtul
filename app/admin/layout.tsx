import { createAuthenticatedClient } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin-shell';
import { AuthError } from '@/components/auth-error';
import type { Profile } from '@/lib/types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { client: supabase, user, error: authError } = await createAuthenticatedClient();

  if (authError || !user) {
    console.error('[admin/layout] auth failed:', authError);
    return <AuthError message="Session expired. Please refresh the page to sign in again." />;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[admin/layout] profiles select error:', error.code, error.message, error.details);
    return <AuthError message={`Unable to load admin profile: ${error.message}`} />;
  }

  if (!profile) {
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
      console.error('[admin/layout] profile auto-create error:', insertError.code, insertError.message, insertError.details);
      return <AuthError message={`Profile not found and auto-create failed: ${insertError.message}`} />;
    }

    if (!created?.is_admin) {
      return <AuthError message="Access denied. Admin privileges required." />;
    }

    return (
      <AdminShell profile={created as Profile} email={user.email}>
        {children}
      </AdminShell>
    );
  }

  if (!profile.is_admin) {
    return <AuthError message="Access denied. Admin privileges required." />;
  }

  return (
    <AdminShell profile={profile as Profile} email={user.email}>
      {children}
    </AdminShell>
  );
}
