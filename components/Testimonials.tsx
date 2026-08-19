"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   PRE-LAUNCH PLACEHOLDER.
   FitVerse has not launched, so no user reviews exist yet. Nothing here is
   presented as a customer quote, a rating, or a result.

   At launch this array is replaced by real reviews synced from Google Reviews,
   the Play Store and the App Store. The rating/source data shape needed for that
   sync is a Phase 2 (UI) change — see AUDIT.md finding REV-04.
──────────────────────────────────────────────────────────────────────────────*/
const testimonials = [
  {
    name: "Everything in one place",
    location: "Our principle",
    text: "Nutrition, training, sleep and recovery belong in one system — not five apps that never talk to each other.",
    initials: "01",
    avatarBg: "#EEF2FF",
    avatarText: "#6366F1",
  },
  {
    name: "Your data stays yours",
    location: "Our commitment",
    text: "Encrypted in transit and at rest, with row-level access controls. We do not sell your health data, and we never will.",
    initials: "02",
    avatarBg: "#d1fae5",
    avatarText: "#059669",
  },
  {
    name: "Built for Indian kitchens",
    location: "Our approach",
    text: "Regional foods and real portions, so logging a meal does not mean translating it into something else first.",
    initials: "03",
    avatarBg: "#fee2e2",
    avatarText: "#dc2626",
  },
  {
    name: "Recovery counts as training",
    location: "Our approach",
    text: "Sleep and rest shape your results as much as the session does. FitVerse is built to treat them that way.",
    initials: "04",
    avatarBg: "#ECFEFF",
    avatarText: "#06B6D4",
  },
  {
    name: "Honest about where we are",
    location: "Our promise",
    text: "We are pre-launch. Nothing on this page claims a user, a result or a review that we do not yet have.",
    initials: "05",
    avatarBg: "#fef3c7",
    avatarText: "#d97706",
  },
];

const allTestimonials = [...testimonials, ...testimonials];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px 0px" });

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const revealVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: "#FDFCF9" }}
      aria-label="What we are building before launch"
    >
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          <motion.p
            variants={revealVariants}
            style={{
              fontSize: "12px", fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#C4956A", marginBottom: "16px",
            }}
          >
            Before launch
          </motion.p>
          <motion.h2
            variants={revealVariants}
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Reviews arrive when our users do.
          </motion.h2>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FDFCF9] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FDFCF9] to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-5 py-2"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            style={{ width: "max-content" }}
          >
            {allTestimonials.map((t, i) => (
              <motion.article
                key={`${t.name}-${i}`}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex-shrink-0 bg-white rounded-2xl p-6 cursor-default"
                style={{
                  width: "300px",
                  maxWidth: "320px",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ color: "#111111", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: t.avatarBg, color: t.avatarText }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{t.name}</p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{t.location}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
