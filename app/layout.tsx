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
  title: 'FitVerse AI Fitness App for Nutrition Workouts Sleep',
  description: 'FitVerse is the all in one AI fitness platform that tracks your nutrition plans your workouts monitors your sleep and coaches you unified in one app',
  keywords: [
    'AI fitness app', 'nutrition tracker', 'workout logger',
    'sleep monitor app', 'personal AI coach', 'calorie counter',
    'fitness tracking app India', 'unified fitness platform',
    'BMI calculator app', 'macro tracker'
  ],
  alternates: {
    canonical: 'https://fitverse.app',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'FitVerse One App Every Dimension of Fit',
    description: 'Track nutrition log workouts analyze sleep and get AI coaching all in one intelligent fitness system',
    type: 'website',
    url: 'https://fitverse.app',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitVerse AI Fitness Platform',
    description: 'One app for nutrition workouts sleep and AI coaching'
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
    <html lang="en" className={`${outfit.variable} ${playfair.variable} scroll-smooth`}>
      <head>
        <link rel="canonical" href="https://fitverse.app" />
        <meta name="robots" content="index, follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              "name": "FitVerse",
              "description": "AI powered unified fitness platform",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "iOS, Android",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              }
            })
          }}
        />
      </head>
      <body className="font-sans antialiased text-[#111827] bg-white">{children}</body>
    </html>
  );
}
