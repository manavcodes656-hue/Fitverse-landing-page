"use client";

import { useState, useRef, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { springSnappy, springRotate, reveal, useInViewSafe } from "@/lib/motion";
import { ACCENT, INK, INK_DIM } from "@/lib/tokens";

const faqs = [
  {
    question: "What is FitVerse exactly?",
    answer:
      "FitVerse is one connected health platform that brings together workouts, nutrition, sleep, recovery, AI coaching, wellness, community, and cycle tracking — instead of juggling five different apps for five different parts of your health, everything lives in one place and actually talks to each other.",
  },
  {
    question: "When does FitVerse launch?",
    answer:
      "We're currently in pre-launch. Join the waitlist to get notified the moment we go live, plus early access ahead of the general public.",
  },
  {
    question: "Is FitVerse free?",
    answer:
      "FitVerse will offer a free tier to get started, with a premium plan for those who want the full experience. We're finalizing pricing details and will share them soon. Waitlist members will be the first to know.",
  },
  {
    question: "How does the AI Coach work?",
    answer:
      "The AI Coach looks at your full picture of your sleep, your workouts, your nutrition, your recovery and gives you guidance based on how your week is actually going, not a generic template. It adjusts as your data changes, so the advice stays relevant to you specifically.",
  },
  {
    question: "Will it be on iOS or Android?",
    answer:
      "Yes, FitVerse is being built for both iOS and Android. Both will be available at launch.",
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
  const reduced = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border-light)",
        borderTop: index === 0 ? "1px solid var(--border-light)" : "none",
      }}
    >
      {/* A real button: reachable by Tab, operable with Enter and Space,
          and its open/closed state is announced rather than implied. */}
      {/* The row is the control, so the press lands on the whole row rather
          than the +/- glyph. It previously carried the inert press:scale class
          and had no press feedback at all. */}
      <motion.button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        whileTap={reduced ? undefined : { scale: 0.995 }}
        transition={springSnappy}
        className="faq-row relative w-full text-left"
        style={{
          padding: "28px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          paddingRight: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        {/* The index is structure, not ornament: its own column, so every
            question starts at the same left edge and nothing can overlap the
            toggle. Small type takes positive tracking — the reverse of the
            display-sized numeral this replaces. */}
        <span
          aria-hidden="true"
          className="faq-num"
          style={{
            width: 34,
            flexShrink: 0,
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 400,
            fontVariantNumeric: "tabular-nums lining-nums",
            letterSpacing: "0.08em",
            color: isOpen ? ACCENT : "#6B6560",
            transition: "color 0.2s ease",
            userSelect: "none",
          }}
        >
          {num}
        </span>

        <span className="faq-q"
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 17,
            fontWeight: 600,
            /* The old amber measured roughly 2.6:1 on the cream surface — the open
               state used to be less readable than the closed one. */
            color: isOpen ? ACCENT : INK,
            lineHeight: 1.4,
            letterSpacing: "-0.015em",
            transition: "color 0.2s ease",
            flex: 1,
          }}
        >
          {faq.question}
        </span>

        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1px solid ${isOpen ? ACCENT : "rgba(26,21,18,0.14)"}`,
            background: isOpen ? ACCENT : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.3s ease, border-color 0.3s ease",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={reduced ? { duration: 0.15 } : springRotate}
            aria-hidden="true"
          >
            <path d="M8 3v10M3 8h10" stroke={isOpen ? "white" : INK} strokeWidth="1.75" strokeLinecap="round" />
          </motion.svg>
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0.15 } : springSnappy}
            style={{ overflow: "hidden" }}
          >
            <p className="faq-a"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 15.5,
                color: INK_DIM,
                lineHeight: 1.6,
                paddingBottom: 28,
                maxWidth: "68ch",
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
  const inView = useInViewSafe(sectionRef, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="faq-section"
      style={{ backgroundColor: "var(--page-bg)", padding: "clamp(40px, 6vh, 56px) 0 100px", overflow: "hidden" }}
      aria-labelledby="faq-heading"
    >
      <div className="faq-wrap" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: reduced ? 0 : 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={reveal}
        >
          <p className="t-eyebrow" style={{ color: ACCENT, marginBottom: 18 }}>
            FAQ
          </p>
          <h2 id="faq-heading" className="t-section-title faq-title" style={{
            color: INK, marginBottom: 16, textWrap: "balance",
          }}>
            Questions we get{" "}
            <span className="t-accent" style={{ color: ACCENT, whiteSpace: "nowrap" }}>a lot.</span>
          </h2>
          <p className="t-lede" style={{
            color: INK_DIM,
            maxWidth: "48ch", margin: "0 auto", textWrap: "pretty",
          }}>
            What FitVerse does, what it costs, and what we can and cannot promise
            before launch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ ...reveal, delay: 0.1 }}
          className="faq-list"
          style={{ maxWidth: 720, margin: "64px auto 0" }}
        >
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
