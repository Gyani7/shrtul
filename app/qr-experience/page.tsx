import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Experiences — Interactive QR Redirects',
  description: 'Generate QR codes that deliver interactive experiences. Not just a scan-to-URL — scan to an engaging journey.',
  alternates: { canonical: 'https://shrtul.com/qr-experience' },
  openGraph: { title: 'QR Code Experiences — Shrtul X', description: 'Generate QR codes that deliver interactive experiences.', url: 'https://shrtul.com/qr-experience' },
};

const Page = createLandingPage({
  title: 'QR Code Experiences',
  headline: 'QR Codes That Do More Than Redirect',
  subtitle: 'Generate QR codes that deliver interactive experiences. Every scan becomes an engaging journey, not just a URL open.',
  badge: 'QR + Experience',
  breadcrumbName: 'QR Experiences',
  path: '/qr-experience',
  features: [
    { icon: 'Sparkles', title: 'Auto-Generated QR', desc: 'Every link gets a QR code automatically. Download as SVG for print or digital.' },
    { icon: 'Sparkles', title: 'Experience-Enabled', desc: 'QR codes linked to experiences show interactive content after scanning.' },
    { icon: 'Sparkles', title: 'Scan Analytics', desc: 'Track QR scans separately from link clicks. Know which channels perform best.' },
  ],
  faqs: [
    { question: 'How do QR code experiences work?', answer: 'When someone scans your QR code, they land on your short link which can include an interactive experience before redirecting to the final destination.' },
    { question: 'Can I download QR codes for print?', answer: 'Yes, QR codes are generated as SVG files that can be downloaded and used in print materials, packaging, or digital displays.' },
    { question: 'Are QR codes free?', answer: 'Yes, QR code generation is included on all plans at no additional cost.' },
  ],
});

export default Page;
