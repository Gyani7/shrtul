import type { MetadataRoute } from 'next';

const BASE = 'https://shrtul.com';

const STATIC_PAGES = [
  { url: '', priority: 1, changeFrequency: 'daily' as const },
  { url: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/templates', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/docs', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/login', priority: 0.4, changeFrequency: 'monthly' as const },
  { url: '/signup', priority: 0.4, changeFrequency: 'monthly' as const },
];

const SEO_PAGES = [
  '/smart-links',
  '/click-experience',
  '/link-engagement',
  '/qr-experience',
  '/link-analytics',
  '/custom-domain',
  '/marketing-links',
  '/dynamic-links',
  '/link-personalization',
  '/interactive-links',
  '/ai-link',
  '/link-campaigns',
  '/developer-api',
  '/ai-redirect',
  '/platform',
  '/studio',
  '/flow',
  '/insights',
  '/market',
  '/labs',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_PAGES.map((page) => ({
    url: `${BASE}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const seoEntries = SEO_PAGES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...seoEntries];
}
