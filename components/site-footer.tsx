import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { Logo } from '@/components/logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Fast, smart, and free URL shortener with analytics, QR codes, passwords, and expiry dates.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://github.com/Gyani7/shrtul" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterSection title="Product">
              <FooterLink href="/login?mode=signup">Get started</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterSection>
            <FooterSection title="Company">
              <FooterLink href="https://github.com/Gyani7/shrtul">GitHub</FooterLink>
            </FooterSection>
            <FooterSection title="Legal">
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
            </FooterSection>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Shrtul. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        {children}
      </Link>
    </li>
  );
}
