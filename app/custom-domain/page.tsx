import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Domain Links — Branded Short Links on Your Domain',
  description: 'Use your own domain for branded short links. Full SSL support, custom domains, and branded experiences that match your brand identity.',
  alternates: { canonical: 'https://shrtul.com/custom-domain' },
  openGraph: { title: 'Custom Domain Links — Shrtul X', description: 'Use your own domain for branded short links with full SSL support.', url: 'https://shrtul.com/custom-domain' },
};

const Page = createLandingPage({
  title: 'Custom Domain Links',
  headline: 'Your Brand, Your Domain, Your Links',
  subtitle: 'Use your own domain for branded short links. Full SSL, custom domains, and experiences that match your brand identity.',
  badge: 'Custom Domains',
  breadcrumbName: 'Custom Domains',
  path: '/custom-domain',
  features: [
    { icon: 'Sparkles', title: 'Your Own Domain', desc: 'Use your branded domain instead of a generic shortener URL.' },
    { icon: 'Sparkles', title: 'Automatic SSL', desc: 'SSL certificates are provisioned automatically for every custom domain.' },
    { icon: 'Sparkles', title: 'Branded Experiences', desc: 'Match your experience templates to your brand colors and messaging.' },
  ],
  faqs: [
    { question: 'How do custom domains work?', answer: 'You add your domain to Shrtul X, update your DNS records to point to our servers, and we automatically provision SSL certificates. Your links will then use your branded domain.' },
    { question: 'How many custom domains can I use?', answer: 'Free plans support 0 custom domains, Starter supports 1, Pro supports 5, and Enterprise supports 20 custom domains.' },
    { question: 'Is SSL included?', answer: 'Yes, SSL certificates are automatically provisioned and renewed for every custom domain at no additional cost.' },
  ],
});

export default Page;
