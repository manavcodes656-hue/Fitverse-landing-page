import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturesContent from "@/components/FeaturesContent";

export const metadata: Metadata = {
  title: "Features — FitVerse",
  description:
    "Explore all five modules of FitVerse: AI Coach, Nutrition Tracker, Workout Log, Sleep Monitor, and Community.",
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
