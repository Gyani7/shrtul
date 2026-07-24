'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Link2, Loader2, AlertCircle, Settings2, QrCode, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-browser';
import { generateShortCode, isValidUrl, normalizeUrl, isSafeUrl } from '@/lib/shortener';
import { toast } from 'sonner';

interface ShortenedLink {
  alias: string;
  original_url: string;
  is_guest: boolean;
  expires_at: string | null;
  guest_session_id: string | null;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'shrtul_guest_session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `gs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function ShortenForm() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const copyLink = useCallback(() => {
    if (!result) return;
    const shortUrl = `${window.location.origin}/${result.alias}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  }, [result]);

  const shareLink = useCallback(async () => {
    if (!result) return;
    const shortUrl = `${window.location.origin}/${result.alias}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Short link', url: shortUrl });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(shortUrl);
      toast.success('Link copied to clipboard!');
    }
  }, [result]);

  const generateQR = useCallback(() => {
    if (!result) return;
    const shortUrl = `${window.location.origin}/${result.alias}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
    setQrUrl(qrApiUrl);
  }, [result]);

  useEffect(() => {
    if (result) {
      generateQR();
    } else {
      setQrUrl('');
    }
  }, [result, generateQR]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);

    const normalized = normalizeUrl(url.trim());
    if (!isValidUrl(normalized)) {
      setError('Please enter a valid URL');
      return;
    }
    if (!isSafeUrl(normalized)) {
      setError('This URL type is not allowed');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = getOrCreateSessionId();

      if (session) {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            url: normalized,
            alias: customAlias.trim() || undefined,
            title: title.trim() || undefined,
            is_guest: false,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to create link');
          setLoading(false);
          return;
        }

        setResult(data as ShortenedLink);
      } else {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: normalized,
            alias: customAlias.trim() || undefined,
            title: title.trim() || undefined,
            is_guest: true,
            guest_session_id: sessionId,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to create link');
          setLoading(false);
          return;
        }

        setResult(data as ShortenedLink);
      }

      setUrl('');
      setCustomAlias('');
      setTitle('');
      setShowAdvanced(false);
      toast.success('Short link created!');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl border-border/60 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-11 h-12 text-base"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 text-base" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Shorten'}
              </Button>
            </div>

            {!isLoggedIn && (
              <p className="text-xs text-muted-foreground">
                You&apos;re creating a temporary link. Sign up to make permanent links with full analytics.
              </p>
            )}

            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Advanced options
              </button>
            )}

            {showAdvanced && isLoggedIn && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="alias" className="text-xs">Custom alias</Label>
                  <Input
                    id="alias"
                    placeholder="my-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="My awesome link"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </form>

          {result && (
            <div className="mt-6 animate-slide-up space-y-4">
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Your shortened link is ready:
                </p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <a
                    href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${result.alias}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary hover:underline"
                  >
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/${result.alias}`}
                  </a>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={copyLink}>
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={shareLink}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground truncate">
                  Goes to: {result.original_url}
                </p>
              </div>

              {qrUrl && (
                <div className="flex justify-center">
                  <div className="rounded-lg border border-border p-3 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="QR Code" width={160} height={160} />
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      Scan to open
                    </p>
                  </div>
                </div>
              )}

              {result.is_guest && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      This is a temporary link and will be deleted after 24 hours unless you claim it.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        window.location.href = '/login?mode=signin&claim=true';
                      }}
                    >
                      Sign in to Claim
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        window.location.href = '/login?mode=signup&claim=true';
                      }}
                    >
                      Create Free Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
