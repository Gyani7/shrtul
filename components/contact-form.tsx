'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Check, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }
      setSent(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 mb-4">
          <Check className="h-6 w-6 text-success" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
        <p className="text-muted-foreground mb-4">We&apos;ll get back to you as soon as possible.</p>
        <Button variant="outline" onClick={() => setSent(false)}>Send another</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="How can we help?" required />
        <Textarea label="Message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us more..." required rows={6} />
        {error && <p className="text-sm text-error flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          <Send className="h-4 w-4" /> Send Message
        </Button>
      </form>
    </Card>
  );
}
