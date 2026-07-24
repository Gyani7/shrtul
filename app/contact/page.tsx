import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Shrtul team. We\'re here to help with any questions or feedback.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mesh-bg py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground">Have a question or feedback? We&apos;d love to hear from you.</p>
          </div>
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
