'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-shimmer h-8 w-8 rounded-full" />
    </div>
  );
}
