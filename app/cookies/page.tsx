import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy — FitVerse",
  description: "How FitVerse uses cookies and similar tracking technologies.",
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="January 1, 2025">
      <p>
        This Cookie Policy explains how FitVerse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) uses cookies and similar tracking technologies when you visit our website or use our platform. By using the Service, you consent to the use of cookies as described in this policy.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners. Similar technologies include local storage, session storage, and pixels.
      </p>
      <p>
        Cookies can be &quot;session cookies&quot; (deleted when you close your browser) or &quot;persistent cookies&quot; (remain on your device for a set period or until deleted).
      </p>

      <h2>2. Cookies We Use</h2>
      <p>We use the following categories of cookies:</p>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Name / Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Essential</strong></td>
            <td>Supabase auth token</td>
            <td>Maintains your authenticated session. Required for the app to function.</td>
            <td>Session / 7 days</td>
          </tr>
          <tr>
            <td><strong>Essential</strong></td>
            <td>CSRF token</td>
            <td>Protects against cross-site request forgery attacks.</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><strong>Functional</strong></td>
            <td>Preferences</td>
            <td>Remembers your display preferences (theme, language).</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td><strong>Analytics</strong></td>
            <td>Vercel Analytics</td>
            <td>Anonymized page view and performance data to improve the Service. No personal data collected.</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><strong>Analytics</strong></td>
            <td>Vercel Speed Insights</td>
            <td>Core Web Vitals measurement for performance optimization.</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>

      <p>
        We do <strong>not</strong> use advertising cookies, third-party tracking pixels, or social media cookies. We do not share cookie data with advertisers.
      </p>

      <h2>3. Why We Use Cookies</h2>
      <p>We use cookies for the following purposes:</p>
      <ul>
        <li><strong>Authentication:</strong> To keep you logged in securely across sessions using Supabase&apos;s auth system.</li>
        <li><strong>Security:</strong> To protect against CSRF attacks and unauthorized access.</li>
        <li><strong>Performance:</strong> To measure and improve page load times and user experience via Vercel&apos;s analytics tools.</li>
        <li><strong>Preferences:</strong> To remember your settings so you don&apos;t have to re-enter them on each visit.</li>
      </ul>

      <h2>4. How to Control Cookies</h2>
      <p>
        You can control and manage cookies in several ways:
      </p>
      <ul>
        <li>
          <strong>Browser settings:</strong> Most browsers allow you to view, delete, and block cookies. Visit your browser&apos;s help documentation:
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          </ul>
        </li>
        <li>
          <strong>Mobile devices:</strong> On iOS, go to Settings → Safari → Privacy &amp; Security. On Android, go to Chrome → Settings → Privacy → Clear browsing data.
        </li>
        <li>
          <strong>Opt-out of analytics:</strong> You can disable Vercel Analytics by enabling &quot;Do Not Track&quot; in your browser settings. Vercel respects this signal.
        </li>
      </ul>
      <p>
        Please note that disabling essential cookies may prevent you from using certain features of the Service, including staying logged in.
      </p>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of material changes by posting a notice on our website. The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised.
      </p>

      <p>
        For questions about our use of cookies, contact us at <a href="mailto:privacy@fitverse.app">privacy@fitverse.app</a>.
      </p>
    </LegalLayout>
  );
}
