import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LiveEngineProvider } from '@/components/live-engine';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://shrtul.com'),
  title: {
    default: 'Shrtul X — AI Click Experience Platform',
    template: '%s | Shrtul X',
  },
  description:
    'Shrtul X is the AI Click Experience Platform that transforms every link into an interactive journey. Smart links, AI-powered experiences, gamified redirects, real-time analytics, and a template marketplace.',
  keywords: [
    'ai click experience',
    'link experience',
    'interactive links',
    'smart links',
    'ai redirect',
    'click experience platform',
    'link engagement',
    'gamified links',
    'link personalization',
    'dynamic redirect',
    'link analytics',
    'qr experience',
    'custom domain links',
    'marketing links',
    'developer api',
  ],
  authors: [{ name: 'Shrtul X' }],
  creator: 'Shrtul X',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shrtul.com',
    siteName: 'Shrtul X',
    title: 'Shrtul X — AI Click Experience Platform',
    description:
      'Transform every link into an interactive journey. AI-powered experiences, gamified redirects, smart analytics, and a template marketplace.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Shrtul X — AI Click Experience Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shrtul X — AI Click Experience Platform',
    description:
      'Transform every link into an interactive journey. AI-powered experiences, gamified redirects, smart analytics, and a template marketplace.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: 'https://shrtul.com' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1c' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LiveEngineProvider>
            {children}
          </LiveEngineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
