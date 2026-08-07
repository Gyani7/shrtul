import Link from 'next/link';
import { Github, Twitter, BookOpen, Code2, FileText, ShieldCheck, Activity, Newspaper, Store, Map } from 'lucide-react';
import { Logo } from '@/components/logo';

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { href: '/smart-links', label: 'Smart Links' },
      { href: '/click-experience', label: 'Click Experiences' },
      { href: '/link-analytics', label: 'Analytics' },
      { href: '/qr-experience', label: 'QR Experiences' },
      { href: '/custom-domain', label: 'Custom Domains' },
      { href: '/developer-api', label: 'Developer API' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/marketing-links', label: 'Marketing' },
      { href: '/link-campaigns', label: 'Campaigns' },
      { href: '/link-personalization', label: 'Personalization' },
      { href: '/interactive-links', label: 'Interactive Links' },
      { href: '/ai-link', label: 'AI Links' },
      { href: '/dynamic-links', label: 'Dynamic Links' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/docs', label: 'Documentation', icon: BookOpen },
      { href: '/developer-api', label: 'API Reference', icon: Code2 },
      { href: '/blog', label: 'Blog', icon: Newspaper },
      { href: '/templates', label: 'Templates', icon: Store },
      { href: '/docs#changelog', label: 'Changelog', icon: Activity },
      { href: '/docs#roadmap', label: 'Roadmap', icon: Map },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/terms', label: 'Terms', icon: FileText },
      { href: '/privacy', label: 'Privacy', icon: ShieldCheck },
      { href: '/docs#security', label: 'Security' },
      { href: '/docs#status', label: 'Status', icon: Activity },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              The AI Click Experience Platform. Transform every link into an interactive journey.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://github.com/Gyani7/shrtul" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Shrtul X. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
