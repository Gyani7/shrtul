import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Personalization — AI-Powered Personalized Redirects',
  description: 'Personalize every click experience with AI. Adapt messaging, themes, and destinations based on user context and behavior.',
  alternates: { canonical: 'https://shrtul.com/link-personalization' },
  openGraph: { title: 'Link Personalization — Shrtul X', description: 'AI-powered personalized redirects based on user context.', url: 'https://shrtul.com/link-personalization' },
};

const Page = createLandingPage({
  title: 'Link Personalization',
  headline: 'Personalize Every Click With AI',
  subtitle: 'Adapt messaging, themes, and destinations based on user context. AI personalization that makes every click feel unique.',
  badge: 'AI Engine',
  breadcrumbName: 'Link Personalization',
  path: '/link-personalization',
  features: [
    { icon: 'Sparkles', title: 'Context-Aware', desc: 'AI adapts the experience based on location, device, and visit history.' },
    { icon: 'Sparkles', title: 'Dynamic Messaging', desc: 'Change headlines, CTAs, and themes based on who is clicking.' },
    { icon: 'Sparkles', title: 'Behavior Learning', desc: 'AI learns from engagement patterns to optimize future experiences.' },
  ],
  faqs: [
    { question: 'How does AI personalization work?', answer: 'Shrtul X AI analyzes visitor context including location, device, language, and past behavior to dynamically adjust the experience messaging, theme, and sometimes the destination URL.' },
    { question: 'Is AI personalization included in the free plan?', answer: 'Basic personalization (geo and device routing) is free. Advanced AI personalization with behavior learning is available on Pro and Enterprise plans.' },
    { question: 'Can I disable AI personalization?', answer: 'Yes, you can disable AI personalization for any link and use static routing rules instead. You have full control over how each link behaves.' },
  ],
});

export default Page;
