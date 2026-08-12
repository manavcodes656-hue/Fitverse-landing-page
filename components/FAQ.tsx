"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const faqs = [
  {
    tag: "App",
    question: "Is FitVerse free to download?",
    answer:
      "Yes. FitVerse is free to download on iOS and Android. Core features — nutrition tracking, workout logging, sleep monitoring, and AI coaching — are available on the free plan. Pro unlocks advanced analytics and unlimited AI queries.",
  },
  {
    tag: "App",
    question: "When does FitVerse launch?",
    answer:
      "Join the waitlist now and you'll be among the first to get access the moment we go live.",
  },
  {
    tag: "AI",
    question: "How does the AI coach actually work?",
    answer:
      "Your AI coach reads across everything — what you ate, how you slept, what you lifted — and connects the dots. It doesn't give generic advice. It sees your full picture and responds to it in real time, every single day.",
  },
  {
    tag: "AI",
    question: "Does the AI replace a real personal trainer?",
    answer:
      "It's not a replacement — it's an upgrade. A human trainer sees you once or twice a week. Your FitVerse AI coach monitors your data 24/7, adjusts your plan when your sleep drops, flags when you're overtraining, and keeps your nutrition aligned with your goals every single day.",
  },
  {
    tag: "Data",
    question: "Is my health data safe with FitVerse?",
    answer:
      "Completely. Your data is encrypted in transit and at rest. We use row-level security on our database — meaning only you can access your own records. We never sell, share, or monetize your personal health data. Ever.",
  },
  {
    tag: "Goal",
    question: "Will FitVerse guarantee I hit my fitness goals?",
    answer:
      "Yes. If you follow your personalized plan consistently, FitVerse will get you there. Every recommendation — your calories, your workouts, your sleep targets — is calculated specifically for your body, your goal, and your lifestyle. The system is designed for one outcome: your results.",
  },
];

function AccordionItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      onClick={onToggle}
      className="relative cursor-pointer select-none"
      style={{
        padding: "28px 0",
        borderBottom: "1px solid rgba(26,21,18,0.08)",
        borderTop: index === 0 ? "1px solid rgba(26,21,18,0.08)" : "none",
        ...(isOpen ? { borderTopColor: "#C4956A", borderTopWidth: "2px" } : {}),
        transition: "border-top-color 0.25s ease",
      }}
    >
      {/* Ghost number */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "Inter,sans-serif",
          fontSize: "80px",
          fontWeight: 900,
          color: isOpen ? "rgba(196,149,106,0.1)" : "rgba(26,21,18,0.04)",
          pointerEvents: "none",
          lineHeight: 1,
          transition: "color 0.3s ease",
          userSelect: "none",
        }}
      >
        {num}
      </span>

      {/* Question row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          paddingRight: 16,
        }}
      >
        <span
          style={{
            fontFamily: "Inter,sans-serif",
            fontSize: "18px",
            fontWeight: 600,
            color: isOpen ? "#C4956A" : "#1A1512",
            lineHeight: 1.4,
            transition: "color 0.2s ease",
            flex: 1,
          }}
        >
          {faq.question}
        </span>

        {/* Icon circle */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: isOpen ? "1px solid #C4956A" : "1px solid rgba(26,21,18,0.12)",
            background: isOpen ? "#C4956A" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <path
              d="M8 3v10M3 8h10"
              stroke={isOpen ? "white" : "#111111"}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </motion.svg>
        </div>
      </div>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: "Inter,sans-serif",
                fontSize: "16px",
                color: "#6B7280",
                lineHeight: 1.7,
                paddingTop: "16px",
                paddingBottom: "8px",
                maxWidth: "600px",
              }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: "#F5F0E8",
        padding: "120px 0",
        overflow: "hidden",
      }}
      aria-label="Frequently Asked Questions"
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            style={{
              fontFamily: "Inter,sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#C4956A",
              marginBottom: "20px",
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontFamily: "Inter,sans-serif",
              fontSize: "clamp(36px,5vw,56px)",
              fontWeight: 700,
              color: "#111111",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              marginBottom: "16px",
            }}
          >
            Questions we get{" "}
            <span style={{ fontStyle: "italic", color: "#C4956A" }}>a lot.</span>
          </h2>
          <p
            style={{
              fontFamily: "Inter,sans-serif",
              fontSize: "18px",
              color: "#6B7280",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            Everything you want to know about FitVerse.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          style={{ maxWidth: "720px", margin: "64px auto 0" }}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={itemVariants}>
              <AccordionItem
                faq={faq}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
