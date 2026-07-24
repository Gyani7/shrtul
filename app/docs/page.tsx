import Link from 'next/link';
import { Book, Code, Zap, Shield, Globe, Terminal, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const sections = [
  { id: 'getting-started', icon: Zap, title: 'Getting started', description: 'Create your first short link in seconds' },
  { id: 'api', icon: Code, title: 'API reference', description: 'Programmatic access to create and manage links' },
  { id: 'features', icon: Shield, title: 'Features', description: 'Password protection, expiry dates, geo-targeting' },
  { id: 'terms', icon: Book, title: 'Terms of service', description: 'Usage guidelines and policies' },
  { id: 'privacy', icon: Globe, title: 'Privacy policy', description: 'How we handle your data' },
];

const apiExamples = [
  {
    method: 'POST',
    endpoint: '/api/links',
    description: 'Create a new short link',
    body: `{
  "url": "https://example.com/very/long/url",
  "alias": "my-link",
  "title": "My awesome link"
}`,
    response: `{
  "alias": "my-link",
  "short_url": "https://shrtul.app/my-link",
  "original_url": "https://example.com/very/long/url"
}`,
  },
  {
    method: 'GET',
    endpoint: '/api/links/:alias',
    description: 'Get link details and analytics',
    response: `{
  "alias": "my-link",
  "original_url": "https://example.com/very/long/url",
  "total_clicks": 142,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}`,
  },
  {
    method: 'DELETE',
    endpoint: '/api/links/:alias',
    description: 'Delete a short link',
    response: `{ "success": true }`,
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Documentation</h1>
            <p className="text-muted-foreground text-lg mb-12">
              Everything you need to know about using Shrtul&apos;s URL shortener and API.
            </p>

            {/* Section cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`}>
                  <Card className="border-border/60 transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer">
                    <CardContent className="flex items-start gap-3 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{s.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Getting started */}
            <section id="getting-started" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Getting started
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  Creating a short link with Shrtul is simple:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mt-3">
                  <li>Paste your long URL into the shortener box on the homepage</li>
                  <li>Optionally add a custom alias, title, or advanced options</li>
                  <li>Click <strong>Shorten</strong> to generate your link</li>
                  <li>Copy and share your new short URL</li>
                  <li>Sign up for an account to track clicks and manage your links</li>
                </ol>
              </div>
            </section>

            {/* API */}
            <section id="api" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                API reference
              </h2>
              <p className="text-muted-foreground mb-6">
                Shrtul provides a RESTful API for creating and managing short links programmatically.
                All API endpoints require authentication via your API key.
              </p>

              <div className="space-y-6">
                {apiExamples.map((api, i) => (
                  <Card key={i} className="border-border/60 overflow-hidden">
                    <CardHeader className="bg-muted/30 py-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={api.method === 'GET' ? 'info' : api.method === 'POST' ? 'default' : 'error'}>
                          {api.method}
                        </Badge>
                        <code className="text-sm font-mono">{api.endpoint}</code>
                      </div>
                      <CardTitle className="text-sm font-normal text-muted-foreground mt-1">
                        {api.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {api.body && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Request body:</p>
                          <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto"><code>{api.body}</code></pre>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Response:</p>
                        <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto"><code>{api.response}</code></pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Features */}
            <section id="features" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Features
              </h2>
              <div className="space-y-4">
                <FeatureItem title="Password protection" description="Add a password to your short links. Visitors will need to enter it before being redirected." />
                <FeatureItem title="Expiry dates" description="Set an automatic expiry date on any link. After expiry, visitors see an 'expired' page instead of being redirected." />
                <FeatureItem title="Click analytics" description="Track every click with country, browser, OS, device, and referrer data. View analytics in your dashboard." />
                <FeatureItem title="Custom aliases" description="Use custom aliases like /my-link instead of random short codes. Up to 20 alphanumeric characters." />
                <FeatureItem title="UTM parameters" description="Automatically append UTM tracking parameters to your destination URLs for marketing campaigns." />
              </div>
            </section>

            {/* Terms */}
            <section id="terms" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Book className="h-6 w-6 text-primary" />
                Terms of service
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>By using Shrtul, you agree to the following terms:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Do not use Shrtul to shorten URLs that point to illegal, malicious, or harmful content</li>
                  <li>Do not use Shrtul for spam, phishing, or deceptive purposes</li>
                  <li>Abusive links may be removed without notice</li>
                  <li>Shrtul is provided &quot;as is&quot; without warranties</li>
                  <li>You are responsible for the content your links point to</li>
                </ul>
              </div>
            </section>

            {/* Privacy */}
            <section id="privacy" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                Privacy policy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We take your privacy seriously. Here&apos;s what we collect and how we use it:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>We store your email and profile information when you create an account</li>
                  <li>We record click data (IP, country, browser, device) for analytics purposes</li>
                  <li>We do not sell or share your data with third parties</li>
                  <li>You can delete your account and all associated data at any time</li>
                  <li>IP addresses are not permanently stored and are used only for geo-targeting</li>
                </ul>
              </div>
            </section>

            <div className="flex justify-center pt-4">
              <Link href="/login?mode=signup" className="inline-flex items-center gap-2 text-primary hover:underline">
                Get started with Shrtul
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
