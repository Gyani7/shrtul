import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing Links — Interactive Campaign Links for Marketers',
  description: 'Create marketing links that engage before they redirect. Add countdowns, CTAs, and polls to your campaign links. Track engagement, not just clicks.',
  alternates: { canonical: 'https://shrtul.com/marketing-links' },
  openGraph: { title: 'Marketing Links — Shrtul X', description: 'Create marketing links that engage before they redirect.', url: 'https://shrtul.com/marketing-links' },
};

const Page = createLandingPage({
  title: 'Marketing Links',
  headline: 'Marketing Links That Engage, Not Just Redirect',
  subtitle: 'Add countdowns, CTAs, and polls to your campaign links. Track engagement and completion rates, not just clicks.',
  badge: 'For Marketing Teams',
  breadcrumbName: 'Marketing Links',
  path: '/marketing-links',
  features: [
    { icon: 'Sparkles', title: 'Campaign CTAs', desc: 'Add call-to-action screens before redirecting to your landing pages.' },
    { icon: 'Sparkles', title: 'UTM Tracking', desc: 'Built-in UTM parameter support for Google Analytics and ad platforms.' },
    { icon: 'Sparkles', title: 'A/B Testing', desc: 'Test different experiences and destinations to optimize conversion.' },
  ],
  faqs: [
    { question: 'How do marketing links improve campaigns?', answer: 'Marketing links add an interactive layer between the click and the redirect, increasing engagement and brand recall. You can also track completion rates and engagement metrics that traditional shorteners do not offer.' },
    { question: 'Can I use UTM parameters?', answer: 'Yes, Shrtul X supports UTM source, medium, campaign, term, and content parameters for every link. These are passed through to your destination URL and analytics platform.' },
    { question: 'Do marketing links work with ad platforms?', answer: 'Yes, marketing links work with Google Ads, Facebook Ads, and any platform that accepts URLs. They are standard HTTP redirects with an experience layer.' },
  ],
});

export default Page;
