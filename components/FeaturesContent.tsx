"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const modules = [
  {
    id: "ai-coach",
    number: "01",
    name: "AI Coach",
    tagline: "Your personal trainer. Always on.",
    description:
      "Reads your nutrition, sleep, and workouts together. Adapts your plan in real time.",
    image: "/aicoach.png",
    imageAlt: "FitVerse AI Coach personalized guidance",
    bg: "bg-white",
    features: [
      "Real-time plan adaptation based on your data",
      "Cross-module insights. Sleep affects workout recommendations.",
      "Weekly check-ins with actionable adjustments",
      "Overtraining detection and recovery alerts",
      "Personalized goal setting and milestone tracking",
    ],
  },
  {
    id: "nutrition",
    number: "02",
    name: "Nutrition Tracker",
    tagline: "Every meal. Tracked precisely.",
    description:
      "14M+ foods including Indian meals. Calories, macros, and micronutrients. Automatic.",
    image: "/nutrition tracker.png",
    imageAlt: "FitVerse nutrition tracking and meal scanning",
    bg: "bg-[#F5F0E8]",
    features: [
      "14M+ food database with Indian regional cuisine",
      "Barcode scanner for packaged foods",
      "Automatic macro and micronutrient breakdown",
      "Custom meal and recipe builder",
      "Calorie deficit/surplus tracking with weekly trends",
    ],
  },
  {
    id: "workout",
    number: "03",
    name: "Workout Log",
    tagline: "Log it. Own it. Beat it.",
    description:
      "5,000+ exercises. Track sets, reps, weight. Watch your strength curve climb.",
    image: "/workout log.png",
    imageAlt: "FitVerse workout tracking and progress",
    bg: "bg-white",
    features: [
      "5,000+ exercises with video demonstrations",
      "Set, rep, and weight tracking with history",
      "Progressive overload suggestions",
      "Custom workout plan builder",
      "Strength curve visualization over time",
    ],
  },
  {
    id: "sleep",
    number: "04",
    name: "Sleep Monitor",
    tagline: "Recovery is training too.",
    description:
      "Analyze sleep stages, quality scores, and how your sleep affects your performance.",
    image: "/sleep monitor.png",
    imageAlt: "FitVerse sleep monitoring and recovery",
    bg: "bg-[#F5F0E8]",
    features: [
      "Sleep stage analysis (REM, deep, light)",
      "Sleep quality scoring with trend tracking",
      "Correlation between sleep and workout performance",
      "Smart bedtime recommendations",
      "Recovery readiness score each morning",
    ],
  },
  {
    id: "community",
    number: "05",
    name: "Community",
    tagline: "Train together. Grow together.",
    description:
      "Connect with people on the same journey. Share progress, join challenges, stay accountable.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80",
    imageAlt: "FitVerse community challenges and social fitness",
    bg: "bg-white",
    features: [
      "Public and private fitness challenges",
      "Progress sharing with your network",
      "Accountability partner matching",
      "Community leaderboards and streaks",
      "Expert-led group programs",
    ],
  },
];

function FeatureSection({ mod, index }: { mod: (typeof modules)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const imageRight = index % 2 === 0;

  return (
    <section
      id={mod.id}
      ref={ref}
      className={`${mod.bg} relative overflow-hidden`}
      style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}
    >
      {/* Large background number */}
      <div
        className="absolute select-none pointer-events-none"
        style={{
          fontSize: "120px",
          fontWeight: 900,
          color: "#111",
          opacity: 0.06,
          top: "50%",
          left: imageRight ? "4%" : "auto",
          right: imageRight ? "auto" : "4%",
          transform: "translateY(-50%)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {mod.number}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-24 w-full">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${!imageRight ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`}>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <span className="text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-4">
              {mod.number}
            </span>
            <h2
              className="font-bold text-[#111827] mb-3"
              style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.025em" }}
            >
              {mod.name}
            </h2>
            <p className="font-semibold text-[#111827] mb-3" style={{ fontSize: "18px" }}>
              {mod.tagline}
            </p>
            <p className="text-[#6B7280] mb-8" style={{ fontSize: "16px", lineHeight: 1.7, maxWidth: "420px" }}>
              {mod.description}
            </p>
            <ul className="space-y-3">
              {mod.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 5-5" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[14px] text-[#374151] leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: imageRight ? 40 : -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "4/3", background: "#E8E3DC" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mod.image}
                alt={mod.imageAlt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  display: "block",
                }}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function FeaturesContent() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#F9FAFB] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-5">
              Platform
            </p>
            <h1
              className="text-[#111827] font-bold mb-5"
              style={{ fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Five modules.
              <br />
              One system.
            </h1>
            <p className="text-[#6B7280]" style={{ fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.7 }}>
              Every dimension of your fitness, connected and intelligent. FitVerse
              doesn&apos;t just track. It understands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature sections */}
      {modules.map((mod, i) => (
        <FeatureSection key={mod.id} mod={mod} index={i} />
      ))}

      {/* CTA strip */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="text-white font-bold mb-4"
              style={{ fontSize: "clamp(24px, 4vw, 40px)", letterSpacing: "-0.025em" }}
            >
              Ready to unify your fitness?
            </h2>
            <p className="text-[#6B7280] text-[16px] mb-8">
              Join the waitlist. Be first when we launch.
            </p>
            <motion.a
              href="/#waitlist"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold rounded-full"
              style={{ padding: "16px 32px", fontSize: "15px" }}
            >
              Get Early Access →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
