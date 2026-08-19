import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — FitVerse",
  description: "How FitVerse collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 16, 2026">
      <p>
        FitVerse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and mobile application (collectively, the &quot;Service&quot;).
      </p>
      <p>
        Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, including:</p>
      <ul>
        <li><strong>Account information:</strong> Name, email address, and password when you register.</li>
        <li><strong>Health and fitness data:</strong> Nutrition logs, workout records, sleep data, and body metrics you choose to enter.</li>
        <li><strong>Waitlist data:</strong> Name and email address if you join our pre-launch waitlist.</li>
        <li><strong>Communications:</strong> Messages you send us via email or support channels.</li>
      </ul>
      <p>We also collect information automatically when you use the Service:</p>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, features used, time spent, and interaction patterns.</li>
        <li><strong>Device data:</strong> IP address (hashed before storage), browser type, operating system, and device identifiers.</li>
        <li><strong>Cookies and tracking:</strong> See our <a href="/cookies">Cookie Policy</a> for details.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service</li>
        <li>Personalize your experience and deliver AI-powered recommendations</li>
        <li>Send transactional emails (waitlist confirmation, account notifications)</li>
        <li>Respond to your comments and questions</li>
        <li>Monitor and analyze usage patterns to improve our platform</li>
        <li>Detect, prevent, and address technical issues and security threats</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal data to third parties. We do not use your health data for advertising purposes.
      </p>

      <h2>3. Data Storage and Security</h2>
      <p>
        Your data is stored securely using Supabase, a PostgreSQL-based cloud database with row-level security (RLS) enabled. All data is encrypted in transit using TLS 1.2+ and at rest using AES-256 encryption.
      </p>
      <p>
        IP addresses submitted through our waitlist form are hashed using SHA-256 before storage and cannot be reversed to identify you.
      </p>
      <p>
        We implement industry-standard security measures including access controls, audit logging, and regular security reviews. However, no method of transmission over the Internet is 100% secure.
      </p>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>We may share your information with:</p>
      <ul>
        <li><strong>Service providers:</strong> Supabase (database), Resend (email delivery), Vercel (hosting). These providers are contractually bound to protect your data.</li>
        <li><strong>Legal requirements:</strong> If required by law, court order, or governmental authority.</li>
        <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice to you.</li>
      </ul>
      <p>We do not share your health or fitness data with any third party without your explicit consent.</p>

      <h2>5. Your Rights</h2>
      <p>Depending on your location, you may have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
        <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
        <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
        <li><strong>Objection:</strong> Object to certain processing activities.</li>
        <li><strong>Withdrawal of consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at <a href="mailto:privacy@fitverse.app">privacy@fitverse.app</a>. We will respond within 30 days.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active or as needed to provide the Service. Waitlist data is retained until the product launches or you request deletion. You may request deletion of your data at any time.
      </p>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        The Service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on our website. Your continued use of the Service after changes constitutes acceptance of the updated policy.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at:<br />
        <strong>FitVerse</strong><br />
        Email: <a href="mailto:privacy@fitverse.app">privacy@fitverse.app</a><br />
        Made in India 🇮🇳
      </p>
    </LegalLayout>
  );
}
