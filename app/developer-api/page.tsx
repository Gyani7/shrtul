import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer API — REST API for Links, Analytics & Webhooks',
  description: 'Build with the Shrtul X REST API. Create links, track analytics, dispatch webhooks, and manage workspaces programmatically.',
  alternates: { canonical: 'https://shrtul.com/developer-api' },
  openGraph: { title: 'Developer API — Shrtul X', description: 'REST API for links, analytics, and webhooks.', url: 'https://shrtul.com/developer-api' },
};

const Page = createLandingPage({
  title: 'Developer API',
  headline: 'Build With Our API',
  subtitle: 'Create links, track analytics, dispatch webhooks, and manage workspaces programmatically. Everything you can do in the dashboard, you can do via API.',
  badge: 'For Developers',
  breadcrumbName: 'Developer API',
  path: '/developer-api',
  features: [
    { icon: 'Sparkles', title: 'REST API', desc: 'Full CRUD API with API key authentication for links, analytics, and more.' },
    { icon: 'Sparkles', title: 'Webhooks', desc: 'Subscribe to real-time events like click.created, link.created, and link.expired.' },
    { icon: 'Sparkles', title: 'Plugin System', desc: 'Extend the platform with custom plugins that hook into link and click events.' },
  ],
  faqs: [
    { question: 'How do I get an API key?', answer: 'Generate API keys from your workspace settings. Each key is scoped to your workspace and can be revoked at any time.' },
    { question: 'Is the API free?', answer: 'Yes, the API is available on all plans. Free plans get 100 API calls per month, Pro plans get 10,000, and Enterprise gets 100,000.' },
    { question: 'What events are available for webhooks?', answer: 'Webhook events include click.created, link.created, link.updated, link.deleted, link.expired, and quota.warning. You can subscribe to any combination of events.' },
  ],
});

export default Page;
