import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL('https://fitverse.app'),
  title: 'FitVerse — AI Fitness App for Nutrition, Workouts & Sleep',
  description:
    'FitVerse is the all-in-one AI fitness app that plans your nutrition, tracks your workouts, monitors your sleep, and coaches you daily. Join the waitlist.',
  keywords: [
    'AI fitness app', 'nutrition tracker', 'workout logger',
    'sleep monitor app', 'personal AI coach', 'calorie counter',
    'fitness tracking app India', 'unified fitness platform',
    'menstrual cycle tracker', 'macro tracker'
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'FitVerse — One app. Every dimension of fit.',
    description:
      'Nutrition, training, sleep and recovery, read together rather than tracked separately. An AI fitness system built in India, launching soon.',
    type: 'website',
    url: '/',
    siteName: 'FitVerse',
    locale: 'en_IN',
    // 1200×630 share image, in /public. Replace it with final artwork when ready.
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'FitVerse — one app for nutrition, training, sleep and recovery' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitVerse — One app. Every dimension of fit.',
    description:
      'Nutrition, training, sleep and recovery, read together rather than tracked separately. Launching soon.',
    images: ['/og-image.jpg']
  }
};

/* Static trusted CSS, no user input. Injected as raw HTML because React would
   escape the quotes in the attribute selectors and break them. */
const NOSCRIPT_STYLE = `<style>
.fvh.pre .fvh-wordmark, .fvh.pre .fvh-tagline, .fvh.pre .fvh-sub, .fvh.pre .fvh-glow,
.fvh.pre .fvh-flame-wrap, .fvh.pre .fvh-frame, .fvh.pre .fvh-frame .fvh-inner,
.fvh-demo .fvh-frame { opacity: 1 !important; visibility: visible !important; }
[style*="opacity:0;"], [style$="opacity:0"] { opacity: 1 !important; transform: none !important; }
[data-intro] { display: none !important; }
</style>`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router has no _document: this layout wraps every page, so the rule's "single page" warning does not apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@800&family=Outfit:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=DM+Serif+Display:ital@1&family=Instrument+Serif:ital@0;1&display=swap"
        />
        {/* Canonical and robots are emitted by the Metadata API above — do not
            duplicate them here. */}
        {/* Without JavaScript the entrance animations never run, so anything
            they start hidden (opacity 0) must be shown, and the splash hidden. */}
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_STYLE }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              "name": "FitVerse",
              "description": "An AI fitness app that reads nutrition, training, sleep and recovery together. Currently in pre-launch.",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "iOS, Android",
              "url": "https://fitverse.app",
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "149",
                "highPrice": "299",
                "priceCurrency": "INR",
                "offerCount": "3",
                "availability": "https://schema.org/PreOrder"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "FitVerse",
              "url": "https://fitverse.app",
              "logo": "https://fitverse.app/logo.jpeg",
              "description": "An AI fitness system built in India, unifying nutrition, training, sleep and recovery in one app.",
              "email": "hello@fitverse.app",
              "foundingDate": "2026",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              }
            })
          }}
        />
      </head>
      <body className="font-body antialiased text-[#111827] bg-[var(--page-bg)]">
        {/* The one navbar: every route renders under it. */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
