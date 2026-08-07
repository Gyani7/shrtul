import { createLandingPage } from '@/components/landing-page-template';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Campaigns — Run Interactive Link Campaigns at Scale',
  description: 'Create, manage, and track interactive link campaigns at scale. UTM support, team workspaces, and campaign-level analytics.',
  alternates: { canonical: 'https://shrtul.com/link-campaigns' },
  openGraph: { title: 'Link Campaigns — Shrtul X', description: 'Run interactive link campaigns at scale with team workspaces.', url: 'https://shrtul.com/link-campaigns' },
};

const Page = createLandingPage({
  title: 'Link Campaigns',
  headline: 'Run Campaigns at Scale',
  subtitle: 'Create, manage, and track interactive link campaigns with team workspaces, UTM support, and campaign-level analytics.',
  badge: 'For Campaign Managers',
  breadcrumbName: 'Link Campaigns',
  path: '/link-campaigns',
  features: [
    { icon: 'Sparkles', title: 'Team Workspaces', desc: 'Collaborate on campaigns with team members and role-based access.' },
    { icon: 'Sparkles', title: 'Bulk Import', desc: 'Import hundreds of links at once via CSV or JSON for large campaigns.' },
    { icon: 'Sparkles', title: 'Campaign Analytics', desc: 'Aggregate analytics across all links in a campaign for unified reporting.' },
  ],
  faqs: [
    { question: 'How many links can I create per campaign?', answer: 'There is no limit on the number of links per campaign. Free plans can create up to 50 links per month, Pro plans up to 10,000, and Enterprise up to 100,000.' },
    { question: 'Can I share campaigns with my team?', answer: 'Yes, team workspaces allow multiple users to collaborate on campaigns with role-based access control. Owners, admins, and members can all access shared campaign links.' },
    { question: 'Is bulk import supported?', answer: 'Yes, you can bulk import links via CSV or JSON files. This is perfect for large campaigns with hundreds or thousands of URLs.' },
  ],
});

export default Page;
