'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import type { Profile } from '@/lib/types';

export function SettingsView({ profile, email }: { profile: Profile; email: string }) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" value={email} disabled hint="Email cannot be changed" />
          {error && <p className="text-sm text-error flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}
          {saved && <p className="text-sm text-success flex items-center gap-1"><Check className="h-4 w-4" /> Saved successfully</p>}
          <Button onClick={handleSave} loading={loading}>Save changes</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Account details and status</CardDescription>
        </CardHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span>{new Date(profile.created_at).toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Account type</span><span>{profile.is_admin ? 'Administrator' : 'Standard'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-success">Active</span></div>
        </div>
      </Card>
    </div>
  );
}
