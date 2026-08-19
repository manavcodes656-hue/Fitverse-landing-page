import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturesContent from "@/components/FeaturesContent";

export const metadata: Metadata = {
  title: "Features — FitVerse",
  description:
    "The seven modules inside FitVerse: Nutrition Tracker, Sleep Tracker, AI Coach, Community, Wellness, For Women, and Workout — built as one connected system.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features — FitVerse",
    description:
      "Seven modules, one system. Nutrition, sleep, AI coaching, community, wellness, cycle tracking and training, connected rather than separate.",
    type: "website",
    url: "/features",
    siteName: "FitVerse",
    locale: "en_IN",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "FitVerse features" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — FitVerse",
    description: "Seven modules, one connected fitness system.",
    images: ["/og-image.jpg"],
  },
};

export default function FeaturesPage() {
  return (
    <main>
      <Navbar />
      <FeaturesContent />
      <Footer />
    </main>
  );
}
