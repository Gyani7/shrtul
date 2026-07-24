import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Shrtul URL shortener platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>We collect the following information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Email address and name when you register.</li>
              <li><strong>Link data:</strong> Original URLs, aliases, titles, and settings you configure.</li>
              <li><strong>Analytics data:</strong> Click counts, approximate geographic location (country/city), browser, device, operating system, and referrer for clicks on your shortened links.</li>
              <li><strong>Technical data:</strong> IP addresses for abuse prevention and rate limiting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain the URL shortening service</li>
              <li>Provide click analytics to link creators</li>
              <li>Prevent abuse, spam, and malicious use</li>
              <li>Support traffic sharing to fund the free service</li>
              <li>Communicate with you about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Traffic Sharing Disclosure</h2>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-foreground font-medium mb-2">How traffic sharing affects your data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>A configurable percentage of clicks on shortened links (currently 20% by default) may be routed through configured redirect endpoints before reaching the destination.</li>
                <li>During this redirect, the destination URL may be passed to the redirect endpoint as a parameter.</li>
                <li>Analytics data (clicks, location, device info) is still collected and attributed to your links regardless of traffic sharing.</li>
                <li>The redirect endpoints may collect their own analytics data in accordance with their own privacy policies.</li>
                <li>This practice is disclosed in our Terms of Service and is necessary to keep the Service free.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Data Storage &amp; Security</h2>
            <p>Data is stored in secure databases with row-level security. Passwords are hashed using bcrypt. We use HTTPS for all connections. Access to personal data is restricted to authorized administrators.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Data Retention</h2>
            <p>Guest links and their analytics data are automatically deleted after 24 hours. Registered user links persist until deleted by the user or account termination. Account data is retained for the lifetime of the account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data through the dashboard</li>
              <li>Delete your links at any time</li>
              <li>Request account deletion by contacting support</li>
              <li>Opt out of analytics by not creating links</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">8. Third-Party Services</h2>
            <p>We use Supabase for database and authentication services. Traffic sharing redirect endpoints may have their own privacy policies. We are not responsible for the privacy practices of third-party services or destination URLs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">9. Children&apos;s Privacy</h2>
            <p>The Service is not intended for children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes through the Service.</p>
          </section>

          <p className="text-xs text-muted-foreground pt-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
