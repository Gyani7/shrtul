import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Links — Gamified & Engaging Link Experiences',
  description: 'Create interactive links with mini games, polls, quizzes, spin wheels, and scratch cards. Every click becomes a two-way interaction.',
  alternates: { canonical: 'https://shrtul.com/interactive-links' },
  openGraph: { title: 'Interactive Links — Shrtul X', description: 'Create interactive links with mini games, polls, quizzes, and spin wheels.', url: 'https://shrtul.com/interactive-links' },
};

const Page = createLandingPage({
  title: 'Interactive Links',
  headline: 'Links That Interact Back',
  subtitle: 'Mini games, polls, quizzes, spin wheels, and scratch cards. Every click becomes a two-way interaction, not a one-way redirect.',
  badge: 'Experience Engine',
  breadcrumbName: 'Interactive Links',
  path: '/interactive-links',
  features: [
    { icon: 'Sparkles', title: 'Gamified Redirects', desc: 'Add mini games before redirecting to maximize engagement and time on page.' },
    { icon: 'Sparkles', title: 'Polls & Quizzes', desc: 'Collect feedback and test knowledge with interactive polls and quizzes.' },
    { icon: 'Sparkles', title: 'Reward Experiences', desc: 'Surprise users with scratch cards and spin wheels for promotions.' },
  ],
  faqs: [
    { question: 'What are interactive links?', answer: 'Interactive links are URLs that include a gamified or interactive experience between the click and the redirect. Users can play a mini game, vote in a poll, answer a quiz, or spin a wheel before reaching the destination.' },
    { question: 'Do interactive links work on mobile?', answer: 'Yes, all interactive experiences are fully responsive and work on mobile devices, tablets, and desktops.' },
    { question: 'Can I collect data from interactive links?', answer: 'Yes, poll responses, quiz answers, and game results are stored and can be viewed in your analytics dashboard or exported via the API.' },
  ],
});

export default Page;
