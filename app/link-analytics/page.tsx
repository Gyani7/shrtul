import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Analytics — Real-Time Click & Engagement Dashboard',
  description: 'Real-time link analytics with click tracking, engagement metrics, geographic breakdowns, device data, and custom events. See everything in one dashboard.',
  alternates: { canonical: 'https://shrtul.com/link-analytics' },
  openGraph: { title: 'Link Analytics — Shrtul X', description: 'Real-time link analytics with click tracking and engagement metrics.', url: 'https://shrtul.com/link-analytics' },
};

const Page = createLandingPage({
  title: 'Link Analytics',
  headline: 'Analytics Beyond Click Counting',
  subtitle: 'Real-time dashboards with engagement metrics, geographic breakdowns, device data, and custom events. Know your audience.',
  badge: 'Analytics Engine',
  breadcrumbName: 'Link Analytics',
  path: '/link-analytics',
  features: [
    { icon: 'Sparkles', title: 'Real-Time Tracking', desc: 'See clicks and engagement as they happen. No delayed reporting.' },
    { icon: 'Sparkles', title: 'Geographic Insights', desc: 'Country, city, and region breakdowns for every click.' },
    { icon: 'Sparkles', title: 'Custom Events', desc: 'Track custom events beyond clicks — signups, purchases, downloads.' },
  ],
  faqs: [
    { question: 'What metrics are tracked?', answer: 'Shrtul X tracks total clicks, unique clicks, completion rate, skip rate, wait time, country, city, device, browser, operating system, and referrer for every link.' },
    { question: 'Is analytics data real-time?', answer: 'Yes, all analytics are real-time. You see clicks and engagement data as they happen, with no delay.' },
    { question: 'Can I track custom events?', answer: 'Yes, you can track custom events like signups, purchases, or downloads using the analytics API or by configuring custom event tracking on your links.' },
  ],
});

export default Page;
