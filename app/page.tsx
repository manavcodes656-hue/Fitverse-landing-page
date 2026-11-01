"use client";

import { motion } from "framer-motion";
import IntroAnimation from "@/components/IntroAnimation";
import Hero from "@/components/Hero";
import Modules from "@/components/Modules";
import FAQ from "@/components/FAQ";
import AppShowcase from "@/components/AppShowcase";
import Footer from "@/components/Footer";
import DarkTransition from "@/components/DarkTransition";
import ErrorBoundary from "@/components/ErrorBoundary";

/* Plain stand-in if the animated hero ever fails: the headline stays readable. */
const HERO_FALLBACK = (
  <section style={{ background: "#121110", color: "#F4EFE9", padding: "120px 20px 80px", textAlign: "center" }}>
    <h1 style={{ fontSize: 48, fontWeight: 800 }}>FitVerse</h1>
    <p style={{ marginTop: 12 }}>One app, your whole body, everyday.</p>
  </section>
);

export default function Home() {
  return (
    <>
      {/* Plays once per session, before the page is readable underneath. */}
      <ErrorBoundary>
        <IntroAnimation />
      </ErrorBoundary>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.45 }}
      >
        <main id="main">
          <ErrorBoundary fallback={HERO_FALLBACK}>
            <Hero />
          </ErrorBoundary>
          <ErrorBoundary>
            <Modules />
          </ErrorBoundary>
          {/* Sits exactly where the reviews section used to. */}
          <ErrorBoundary>
            <AppShowcase />
          </ErrorBoundary>
          <FAQ />
        </main>
        <DarkTransition />
        <Footer />
      </motion.div>
    </>
  );
}
