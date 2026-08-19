import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — FitVerse",
  description: "Terms and conditions for using the FitVerse platform.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="August 16, 2026">
      <p>
        Welcome to FitVerse. By accessing or using our platform, website, or mobile application (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
      </p>
      <p>
        If you do not agree to these Terms, you may not access or use the Service.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account, joining our waitlist, or otherwise using the Service, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them and our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        FitVerse is an AI-powered fitness platform that provides nutrition tracking, workout logging, sleep monitoring, and personalized coaching. The Service is currently in pre-launch phase. Features described on our website represent our intended product and may change before or after launch.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        When you create an account, you agree to:
      </p>
      <ul>
        <li>Provide accurate, current, and complete information</li>
        <li>Maintain the security of your password and account</li>
        <li>Notify us immediately of any unauthorized use of your account</li>
        <li>Accept responsibility for all activities that occur under your account</li>
      </ul>
      <p>
        We reserve the right to suspend or terminate accounts that violate these Terms.
      </p>

      <h2>4. Health and Fitness Disclaimer</h2>
      <p>
        <strong>Important:</strong> FitVerse is not a medical service. The information, recommendations, and AI-generated content provided through the Service are for general informational and fitness purposes only and do not constitute medical advice, diagnosis, or treatment.
      </p>
      <p>
        Always consult a qualified healthcare professional before starting any new fitness or nutrition program, especially if you have a medical condition, injury, or health concern. FitVerse is not responsible for any health outcomes resulting from use of the Service.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
        <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
        <li>Transmit any harmful, offensive, or disruptive content</li>
        <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
        <li>Use automated tools to scrape, crawl, or extract data from the Service</li>
        <li>Impersonate any person or entity</li>
        <li>Interfere with the proper functioning of the Service</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are owned by FitVerse and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
      </p>
      <p>
        You retain ownership of any content you submit to the Service (such as food logs or workout data). By submitting content, you grant FitVerse a non-exclusive, royalty-free license to use, process, and display that content solely to provide the Service to you.
      </p>

      <h2>7. Subscription and Payments</h2>
      <p>
        When paid plans become available, the following terms will apply:
      </p>
      <ul>
        <li>Subscriptions are billed in advance on a monthly or annual basis</li>
        <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
        <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
        <li>Refunds are available within 7 days of initial purchase for new subscribers</li>
        <li>We reserve the right to change pricing with 30 days&apos; notice</li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, FitVerse shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service.
      </p>
      <p>
        Our total liability to you for any claims arising from these Terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or ₹1,000, whichever is greater.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless FitVerse and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may terminate or suspend your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will immediately cease. You may delete your account at any time by contacting us.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in India.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will provide notice of material changes by email or by posting a notice on our website. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
      </p>

      <h2>13. Contact</h2>
      <p>
        For questions about these Terms, contact us at:<br />
        <strong>FitVerse</strong><br />
        Email: <a href="mailto:legal@fitverse.app">legal@fitverse.app</a><br />
        Made in India 🇮🇳
      </p>
    </LegalLayout>
  );
}
