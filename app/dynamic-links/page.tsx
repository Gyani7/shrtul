import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dynamic Links — Smart Redirects by Location, Device & Language',
  description: 'Create dynamic links that route users to different destinations based on location, device, and language. One link, many destinations.',
  alternates: { canonical: 'https://shrtul.com/dynamic-links' },
  openGraph: { title: 'Dynamic Links — Shrtul X', description: 'Smart redirects by location, device, and language.', url: 'https://shrtul.com/dynamic-links' },
};

const Page = createLandingPage({
  title: 'Dynamic Links',
  headline: 'One Link, Many Destinations',
  subtitle: 'Dynamic links route users to different destinations based on their location, device, and language. One link for every audience.',
  badge: 'Dynamic Redirect Engine',
  breadcrumbName: 'Dynamic Links',
  path: '/dynamic-links',
  features: [
    { icon: 'Sparkles', title: 'Geo Routing', desc: 'Send users from different countries to localized pages automatically.' },
    { icon: 'Sparkles', title: 'Device Routing', desc: 'Mobile users go to app stores, desktop users go to web pages.' },
    { icon: 'Sparkles', title: 'Language Routing', desc: 'Route based on browser language settings for localized experiences.' },
  ],
  faqs: [
    { question: 'What are dynamic links?', answer: 'Dynamic links are URLs that redirect to different destinations based on the visitor context. One link can send mobile users to an app store, desktop users to a website, and users from different countries to localized pages.' },
    { question: 'How many routing rules can I set?', answer: 'You can set routing rules for as many countries, devices, and languages as you need. There is no limit on the number of routing rules per link.' },
    { question: 'Do dynamic links work with QR codes?', answer: 'Yes, dynamic links work perfectly with QR codes. When scanned, the QR code opens the dynamic link which then routes to the appropriate destination.' },
  ],
});

export default Page;
