import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Redirect — AI-Powered Smart Redirects',
  description: 'AI-powered redirects that personalize every click. Route users intelligently based on context, behavior, and preferences.',
  alternates: { canonical: 'https://shrtul.com/ai-redirect' },
  openGraph: { title: 'AI Redirect — Shrtul X', description: 'AI-powered smart redirects that personalize every click.', url: 'https://shrtul.com/ai-redirect' },
};

const Page = createLandingPage({
  title: 'AI Redirect',
  headline: 'Redirects Powered by AI',
  subtitle: 'AI-powered redirects that personalize every click. Route users intelligently based on context, behavior, and preferences.',
  badge: 'AI Engine',
  breadcrumbName: 'AI Redirect',
  path: '/ai-redirect',
  features: [
    { icon: 'Sparkles', title: 'Smart Routing', desc: 'AI selects the best destination based on user context and past behavior.' },
    { icon: 'Sparkles', title: 'Experience Selection', desc: 'AI picks the optimal experience template for each visitor.' },
    { icon: 'Sparkles', title: 'Performance Learning', desc: 'AI learns from engagement data to improve routing over time.' },
  ],
  faqs: [
    { question: 'What is an AI redirect?', answer: 'An AI redirect uses artificial intelligence to select the best destination URL and experience for each visitor based on their context, device, location, and behavior patterns.' },
    { question: 'How is AI redirect different from a regular redirect?', answer: 'A regular redirect always sends users to the same URL. An AI redirect can send different users to different destinations and show different experiences based on what AI predicts will perform best.' },
    { question: 'Can I override AI redirect decisions?', answer: 'Yes, you can set static routing rules that override AI decisions, or let AI handle routing entirely. You have full control.' },
  ],
});

export default Page;
