import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

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
    // NOTE: /public/og-image.jpg does not exist yet — must be created at
    // 1200×630 before launch, or every social share renders blank.
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
    <html lang="en-IN" className={`${outfit.variable} ${playfair.variable} scroll-smooth`}>
      <head>
        {/* Canonical and robots are emitted by the Metadata API above — do not
            duplicate them here. */}
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
      <body className="font-sans antialiased text-[#111827] bg-white">{children}</body>
    </html>
  );
}
