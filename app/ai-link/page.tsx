import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Links — AI-Powered Smart Link Platform',
  description: 'AI links that personalize, optimize, and adapt every click experience. AI-powered redirects, experience generation, and analytics recommendations.',
  alternates: { canonical: 'https://shrtul.com/ai-link' },
  openGraph: { title: 'AI Links — Shrtul X', description: 'AI-powered smart links that personalize every click experience.', url: 'https://shrtul.com/ai-link' },
};

const Page = createLandingPage({
  title: 'AI Links',
  headline: 'AI Links That Learn and Adapt',
  subtitle: 'AI-powered redirects that personalize experiences, generate content, and recommend optimizations. The future of link management.',
  badge: 'AI Engine',
  breadcrumbName: 'AI Links',
  path: '/ai-link',
  features: [
    { icon: 'Sparkles', title: 'AI Experience Builder', desc: 'Describe your campaign in plain language and AI generates the perfect experience.' },
    { icon: 'Sparkles', title: 'AI Personalization', desc: 'Automatically tailor the click experience based on visitor context.' },
    { icon: 'Sparkles', title: 'AI Recommendations', desc: 'Get smart suggestions for improving engagement and conversion.' },
  ],
  faqs: [
    { question: 'What makes a link AI-powered?', answer: 'AI-powered links use artificial intelligence to personalize the click experience, generate experience configurations from natural language descriptions, and provide recommendations for improving engagement.' },
    { question: 'Do I need to know AI to use AI links?', answer: 'No, you do not need any AI knowledge. Simply describe what you want your link experience to do, and the AI handles the configuration automatically.' },
    { question: 'Is AI link generation included in the free plan?', answer: 'Basic AI features are available on all plans. Advanced AI experience generation and personalization are available on Pro and Enterprise plans.' },
  ],
});

export default Page;
