"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Modules from "@/components/Modules";
import ComparisonSlider from "@/components/ComparisonSlider";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Navbar />
      <main>
        <Hero />
        <Modules />
        <ComparisonSlider />
        <FAQ />
        <Testimonials />
      </main>
      <Footer />
    </motion.div>
  );
}
