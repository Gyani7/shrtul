import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Shrtul URL shortener platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By using Shrtul (&quot;the Service&quot;), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Service Description</h2>
            <p>Shrtul is a URL shortening service that allows users to create short links, QR codes, and track click analytics. Guest links expire after 24 hours. Registered users can create permanent links.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Acceptable Use</h2>
            <p>You agree not to use Shrtul to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Shorten URLs that point to illegal, harmful, or malicious content</li>
              <li>Shorten URLs that contain malware, phishing, or spyware</li>
              <li>Shorten URLs that violate intellectual property rights</li>
              <li>Shorten URLs that promote hate, violence, or discrimination</li>
              <li>Use the Service for spam or mass unsolicited messaging</li>
              <li>Attempt to overload, crash, or compromise the Service</li>
            </ul>
            <p>Violations may result in immediate termination of your account and links.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Traffic Sharing &amp; Redirect Policy</h2>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-foreground font-medium mb-2">Important Disclosure:</p>
              <p>By using Shrtul, you acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>A configurable percentage of shortened-link traffic (currently 20% by default) may be redirected through configured redirect endpoints before reaching the destination URL.</li>
                <li>This traffic sharing helps support the free operation of the Service.</li>
                <li>The redirect is seamless and does not affect the final destination of your shortened links.</li>
                <li>Analytics and click tracking continue to function normally for all redirected traffic.</li>
                <li>The traffic sharing percentage and endpoints are managed by the platform administrators and may change over time.</li>
                <li>Users can contact us if they have concerns about this practice.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Link Expiration</h2>
            <p>Guest links (created without an account) expire automatically after 24 hours. Registered user links are permanent unless explicitly deleted or an expiry date is set. Expired links will display a 404 page.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Privacy</h2>
            <p>Your use of the Service is also governed by our Privacy Policy. Please review it to understand our data practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>Shrtul is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from the use or inability to use the Service. We are not responsible for the content of shortened URLs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">8. Account Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms. Banned users will be unable to access their dashboard or create new links.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">9. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">10. Contact</h2>
            <p>If you have questions about these Terms, please contact us through our contact page.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
