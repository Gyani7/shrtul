import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://shrtul.com'),
  title: {
    default: 'Shrtul — Fast, Free, Smart URL Shortener',
    template: '%s | Shrtul',
  },
  description: 'Shrtul is a premium URL shortener with QR codes, password protection, click analytics, custom aliases, and free guest links. Shorten, track, and share smarter.',
  keywords: ['url shortener', 'shorten url', 'qr code', 'link analytics', 'custom alias', 'short link', 'free url shortener'],
  authors: [{ name: 'Shrtul' }],
  creator: 'Shrtul',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shrtul.com',
    siteName: 'Shrtul',
    title: 'Shrtul — Fast, Free, Smart URL Shortener',
    description: 'Shorten, track, and share smarter with QR codes, analytics, and custom aliases.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Shrtul URL Shortener' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shrtul — Fast, Free, Smart URL Shortener',
    description: 'Shorten, track, and share smarter with QR codes, analytics, and custom aliases.',
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
