"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    name: "Karan V.",
    location: "Delhi",
    text: "Been using it for 6 weeks. My sleep improved just by following the recovery tips. Didn't expect that from a fitness app.",
    initials: "KV",
    avatarBg: "#EEF2FF",
    avatarText: "#6366F1",
  },
  {
    name: "Sneha R.",
    location: "Pune",
    text: "Finally an app that has poha and dal makhani. I stopped guessing my calories. The tracking actually makes sense now.",
    initials: "SR",
    avatarBg: "#fee2e2",
    avatarText: "#dc2626",
  },
  {
    name: "Mihir D.",
    location: "Bengaluru",
    text: "The AI coach noticed I was overtraining before I did. Told me to rest. I listened. My lifts went up the next week.",
    initials: "MD",
    avatarBg: "#d1fae5",
    avatarText: "#059669",
  },
  {
    name: "Tanvi A.",
    location: "Mumbai",
    text: "Switched from using 3 apps to just this. The unified dashboard is genuinely impressive. Everything I need in one scroll.",
    initials: "TA",
    avatarBg: "#ECFEFF",
    avatarText: "#06B6D4",
  },
  {
    name: "Aditya S.",
    location: "Hyderabad",
    text: "Lost 5kg in 2 months. The deficit plan was simple to follow and the weekly check-ins kept me accountable.",
    initials: "AS",
    avatarBg: "#fef3c7",
    avatarText: "#d97706",
  },
];

const allTestimonials = [...testimonials, ...testimonials];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#C4956A">
          <path d="M6 1l1.236 2.506L10 3.927l-2 1.95.472 2.75L6 7.25l-2.472 1.377L4 5.877l-2-1.95 2.764-.421L6 1z" />
        </svg>
      ))}
    </div>
  );
}

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
      aria-label="User Testimonials"
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
            What people are saying
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
            Real results. Real people.
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
                  borderLeft: "3px solid #C4956A",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <StarRating />
                <p style={{ color: "#111111", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
                  &ldquo;{t.text}&rdquo;
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
