"use client";

import { useState, useRef, useId } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { springSnappy, springRotate, reveal } from "@/lib/motion";

const faqs = [
  {
    question: "What is FitVerse?",
    answer:
      "FitVerse is one app for the whole picture of your health: nutrition, workouts, sleep, AI coaching, wellness, community, and cycle tracking. Instead of seven separate trackers that each know one thing about you, it's a single system where every part informs the others.",
  },
  {
    question: "How is it different from using separate fitness apps?",
    answer:
      "Separate apps each hold one piece and never talk to each other, so a rough week of sleep never changes what your training app asks of you the next morning. FitVerse reads them together, and that connection is the whole product, not a feature bolted on the side.",
  },
  {
    question: "Who is FitVerse for, and do I need any experience?",
    answer:
      "FitVerse is for anyone building a routine around a real life, from students and working professionals to complete beginners and people already deep into training. You don't need a gym, equipment or any experience to start. Log what you already eat, how you sleep and how you move, and let the coaching build from there.",
  },
  {
    question: "Can I track my menstrual cycle in FitVerse?",
    answer:
      "Yes. Cycle tracking is built in as one of FitVerse's seven modules, not another separate app to keep alongside this one. It sits with your nutrition, sleep and training, so your plan reflects all of you rather than a version with a piece missing.",
  },
  {
    question: "Is my health data private and secure?",
    answer:
      "Yes. Everything is encrypted in transit and at rest, every record is scoped to your account alone, and we never sell your data or use your health information for advertising. You can request deletion at any time, and full detail is in our Privacy Policy.",
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
        className="relative w-full text-left"
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
          style={{
            width: 34,
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums lining-nums",
            letterSpacing: "0.08em",
            color: isOpen ? "#A83D0B" : "#6B6560",
            transition: "color 0.2s ease",
            userSelect: "none",
          }}
        >
          {num}
        </span>

        <span
          style={{
            fontSize: "clamp(1rem, 1.9vw, 1.125rem)",
            fontWeight: 600,
            /* The old amber measured roughly 2.6:1 on the cream surface — the open
               state used to be less readable than the closed one. */
            color: isOpen ? "#A83D0B" : "#1A1512",
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
            border: `1px solid ${isOpen ? "#A83D0B" : "rgba(26,21,18,0.14)"}`,
            background: isOpen ? "#A83D0B" : "white",
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
            <path d="M8 3v10M3 8h10" stroke={isOpen ? "white" : "#1A1512"} strokeWidth="1.75" strokeLinecap="round" />
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
            <p
              style={{
                fontSize: "1rem",
                color: "#57514B",
                lineHeight: 1.68,
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
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: "#F5F0E8", padding: "clamp(80px, 12vh, 120px) 0", overflow: "hidden" }}
      aria-labelledby="faq-heading"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: reduced ? 0 : 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={reveal}
        >
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#A83D0B", marginBottom: 18,
          }}>
            FAQ
          </p>
          <h2 id="faq-heading" style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 700, color: "#1A1512",
            lineHeight: 1.06, letterSpacing: "-0.03em", marginBottom: 16, textWrap: "balance",
          }}>
            Questions we get{" "}
            <span style={{ fontStyle: "italic", color: "#A83D0B" }}>a lot.</span>
          </h2>
          <p style={{
            fontSize: "clamp(1rem, 1.9vw, 1.125rem)", color: "#57514B",
            maxWidth: "48ch", margin: "0 auto", lineHeight: 1.6, textWrap: "pretty",
          }}>
            What FitVerse does, what it costs, and what we can and cannot promise
            before launch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ ...reveal, delay: 0.1 }}
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
