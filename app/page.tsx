"use client";

import { motion } from "framer-motion";
import IntroAnimation from "@/components/IntroAnimation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Modules from "@/components/Modules";
import FAQ from "@/components/FAQ";
import AppShowcase from "@/components/AppShowcase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Plays once per session, before the page is readable underneath. */}
      <IntroAnimation />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.45 }}
      >
        <Navbar />
        <main id="main">
          <Hero />
          <Modules />
          <FAQ />
          {/* Sits exactly where the reviews section used to. */}
          <AppShowcase />
        </main>
        <Footer />
      </motion.div>
    </>
  );
}
