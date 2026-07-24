import { createAuthenticatedClient } from '@/lib/supabase-server';
import { SettingsView } from '@/components/settings-view';
import { AuthError } from '@/components/auth-error';
import type { Profile } from '@/lib/types';

export default async function SettingsPage() {
  const { client: supabase, user, error: authError } = await createAuthenticatedClient();

  if (authError || !user) {
    console.error('[dashboard/settings] auth failed:', authError);
    return <AuthError message="Unable to load settings. Please refresh the page." />;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[dashboard/settings] profiles select error:', error.code, error.message, error.details);
    return <AuthError message={`Unable to load your profile: ${error.message}`} />;
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
      console.error('[dashboard/settings] profile auto-create error:', insertError.code, insertError.message, insertError.details);
      return <AuthError message={`Profile not found and auto-create failed: ${insertError.message}`} />;
    }

    if (!created) {
      return <AuthError message="Profile not found and auto-create returned no data." />;
    }

    return <SettingsView profile={created as Profile} email={user.email} />;
  }

  return <SettingsView profile={profile as Profile} email={user.email} />;
}
