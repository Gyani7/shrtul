import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Engagement — Track Attention, Completion & Skip Rates',
  description: 'Go beyond click counting. Track engagement metrics like completion rate, skip rate, wait time, and user behavior for every link.',
  alternates: { canonical: 'https://shrtul.com/link-engagement' },
  openGraph: { title: 'Link Engagement — Shrtul X', description: 'Track attention, completion, and skip rates for every link.', url: 'https://shrtul.com/link-engagement' },
};

const Page = createLandingPage({
  title: 'Link Engagement',
  headline: 'Engagement Metrics That Matter',
  subtitle: 'Stop counting clicks. Start measuring attention, completion rates, and user behavior with engagement-first analytics.',
  badge: 'Analytics Engine',
  breadcrumbName: 'Link Engagement',
  path: '/link-engagement',
  features: [
    { icon: 'Sparkles', title: 'Completion Rate', desc: 'See what percentage of users finish your experience before redirecting.' },
    { icon: 'Sparkles', title: 'Skip Rate', desc: 'Know how many users skip the experience to reach the destination faster.' },
    { icon: 'Sparkles', title: 'Wait Time', desc: 'Track average time spent on each experience to optimize engagement.' },
  ],
  faqs: [
    { question: 'What engagement metrics does Shrtul X track?', answer: 'Shrtul X tracks total clicks, unique clicks, completion rate, skip rate, average wait time, device, browser, country, and referrer for every link.' },
    { question: 'How is engagement different from clicks?', answer: 'Clicks only tell you how many people visited. Engagement tells you how they interacted — did they stay for the experience, skip it, or abandon the page entirely.' },
    { question: 'Can I export engagement data?', answer: 'Yes, engagement data can be exported via the API or downloaded from the dashboard. All metrics are available in real-time.' },
  ],
});

export default Page;
