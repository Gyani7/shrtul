import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Powered Smart Links — Intelligent Redirect Experiences',
  description: 'Create smart links with AI-powered personalization, geo-routing, device detection, and interactive experiences. Every click becomes a tailored journey.',
  alternates: { canonical: 'https://shrtul.com/smart-links' },
  openGraph: { title: 'AI-Powered Smart Links — Shrtul X', description: 'Create smart links with AI-powered personalization, geo-routing, and interactive experiences.', url: 'https://shrtul.com/smart-links' },
};

const Page = createLandingPage({
  title: 'Smart Links',
  headline: 'Smart Links That Think Before They Redirect',
  subtitle: 'AI-powered links that adapt to your users location, device, and behavior. Deliver the right destination, every time.',
  badge: 'Smart Link Engine',
  breadcrumbName: 'Smart Links',
  path: '/smart-links',
  features: [
    { icon: 'Sparkles', title: 'Geo Redirect', desc: 'Route users to different destinations based on their country — automatically.' },
    { icon: 'Sparkles', title: 'Device Detection', desc: 'Send mobile users to app stores, desktop users to web pages. No manual setup.' },
    { icon: 'Sparkles', title: 'Language Routing', desc: 'Redirect users to localized content based on their browser language settings.' },
  ],
  faqs: [
    { question: 'What are smart links?', answer: 'Smart links are URLs that automatically adapt their destination based on the visitor context, such as location, device, or language. Instead of one fixed destination, a smart link can route different users to different pages.' },
    { question: 'How does geo-routing work?', answer: 'When a user clicks your smart link, Shrtul X detects their country from their IP address and redirects them to the destination you configured for that country. You can set different URLs for each country.' },
    { question: 'Can I use smart links for free?', answer: 'Yes, smart links are available on all plans including the free tier. Geo-routing and device detection are included at no cost.' },
  ],
});

export default Page;
