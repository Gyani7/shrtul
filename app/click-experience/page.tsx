import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Click Experiences — Interactive Link Redirects',
  description: 'Add interactive experiences between the click and the redirect. Countdowns, polls, mini games, AI avatars, and more — every link becomes an experience.',
  alternates: { canonical: 'https://shrtul.com/click-experience' },
  openGraph: { title: 'Click Experiences — Shrtul X', description: 'Add interactive experiences between the click and the redirect.', url: 'https://shrtul.com/click-experience' },
};

const Page = createLandingPage({
  title: 'Click Experiences',
  headline: 'Every Click Becomes an Experience',
  subtitle: 'Add interactive layers between the click and the redirect. Countdowns, polls, games, AI avatars — your links do more than redirect.',
  badge: 'Experience Engine',
  breadcrumbName: 'Click Experiences',
  path: '/click-experience',
  features: [
    { icon: 'Sparkles', title: '13+ Templates', desc: 'Choose from countdowns, polls, quizzes, spin wheels, scratch cards, mini games, and more.' },
    { icon: 'Sparkles', title: 'Engagement Tracking', desc: 'Measure completion rate, skip rate, and wait time — not just clicks.' },
    { icon: 'Sparkles', title: 'Custom Experiences', desc: 'Configure each experience with your own messaging, colors, and timing.' },
  ],
  faqs: [
    { question: 'What is a click experience?', answer: 'A click experience is an interactive screen shown to users between clicking your link and reaching the destination. Instead of an instant redirect, users see a countdown, poll, game, or other interactive content first.' },
    { question: 'Do click experiences slow down redirects?', answer: 'You control the duration. Experiences can be as short as 3 seconds or as long as you want. Users can also skip most experiences to reach the destination faster.' },
    { question: 'Can I track engagement on experiences?', answer: 'Yes, Shrtul X tracks completion rate, skip rate, and average wait time for every experience. You can see exactly how users interact with your links.' },
  ],
});

export default Page;
