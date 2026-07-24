'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { generateShortCode, normalizeUrl, isValidUrl, isSafeUrl, isValidAlias } from '@/lib/shortener';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link2, QrCode, Clock, Shield, BarChart3, Sparkles, ArrowRight, Zap, Globe, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShortenerForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ short_url: string; alias: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized) || !isSafeUrl(normalized)) {
      setError('Please enter a valid URL');
      return;
    }

    if (alias && !isValidAlias(alias)) {
      setError('Alias must be 3-30 chars: letters, numbers, hyphens, underscores');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const finalAlias = alias || generateShortCode();

      if (user) {
        const { data: ws } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);

        if (ws && ws.length > 0) {
          const body: Record<string, unknown> = {
            url: normalized,
            alias: finalAlias,
            title: '',
          };
          if (password) body.password = password;
          if (expiry) body.expires_at = new Date(expiry).toISOString();

          const res = await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to create link');
          setResult({ short_url: data.short_url, alias: data.alias });
          return;
        }
      }

      // Guest link
      let guestSessionId = localStorage.getItem('guest_session_id');
      if (!guestSessionId) {
        guestSessionId = crypto.randomUUID();
        localStorage.setItem('guest_session_id', guestSessionId);
      }

      const body: Record<string, unknown> = {
        url: normalized,
        alias: finalAlias,
        title: '',
        is_guest: true,
        guest_session_id: guestSessionId,
      };
      if (password) body.password = password;

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create link');
      setResult({ short_url: data.short_url, alias: data.alias });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="glass-strong rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
          <div className="flex items-center pl-3">
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none py-3"
            required
          />
          <Button type="submit" size="lg" loading={loading} className="shrink-0">
            <Sparkles className="h-4 w-4" />
            Shorten
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </button>

        {showAdvanced && (
          <div className="glass rounded-xl p-4 space-y-3 animate-slide-up">
            <Input
              label="Custom alias"
              placeholder="my-custom-link"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              hint="3-30 chars: letters, numbers, hyphens"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Password (optional)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Protect your link"
                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Input
                label="Expiry date (optional)"
                type="datetime-local"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-4 py-2 animate-fade-in">
            {error}
          </div>
        )}
      </form>

      {result && (
        <div className="mt-4 glass-strong rounded-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/15">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Your short link is ready</p>
                <p className="text-sm font-medium text-foreground truncate">{result.short_url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href={`/api/qr/${result.alias}`} target="_blank" rel="noopener noreferrer">
                  <QrCode className="h-3.5 w-3.5" />
                  QR
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
