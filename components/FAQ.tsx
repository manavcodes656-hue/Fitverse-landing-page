"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const faqs = [
  {
    question: "What is FitVerse, exactly?",
    answer:
      "One app covering seven connected areas of your health: nutrition, sleep, AI coaching, community, wellness, cycle tracking, and workouts. The point isn't that each one exists — plenty of apps do one well. The point is that they read each other, so a bad week of sleep actually changes what your plan asks of you.",
  },
  {
    question: "When does FitVerse launch?",
    answer:
      "We haven't announced a public date yet. We're in pre-launch and building toward it. Join the waitlist and you'll hear it from us before it goes anywhere else — including the launch date itself, as soon as we can commit to one.",
  },
  {
    question: "Is FitVerse free?",
    answer:
      "No, and we'd rather be straight about it than surprise you later. FitVerse is a paid subscription starting at ₹149/month on the annual plan, with monthly and 6-month options available. Every plan opens with a 7-day free trial, so you can decide after using it rather than before.",
  },
  {
    question: "How does the AI coach work?",
    answer:
      "It reads across your logged data rather than at one slice of it — what you ate, how you slept, what you trained — and adjusts your plan as those inputs move. It's designed to notice patterns across areas that separate apps can't see, because they only ever hold one piece.",
  },
  {
    question: "How is my health data protected?",
    answer:
      "Your data is encrypted in transit and at rest, and our database uses row-level security so records are scoped to you. We don't sell, share or monetise personal health data. No system is completely secure — anyone claiming otherwise is overselling — but security is treated as a core requirement, not a feature. Full detail is in our Privacy Policy.",
  },
  {
    question: "Will it be on iOS and Android?",
    answer:
      "Both are planned for launch. Neither is published yet, which is why the store badges on this site are marked coming soon rather than linking anywhere. Waitlist members get the download links first.",
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
            What FitVerse does, what it costs, and what we can and cannot
            promise before launch.
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
