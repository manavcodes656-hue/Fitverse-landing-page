"use client";

import { motion, useReducedMotion } from "framer-motion";
import PhoneFrame from "@/components/ui/PhoneFrame";
import { ACCENT, INK, INK_DIM } from "@/lib/tokens";

/* One module, laid out like the home page's feature carousel: the number in the
   accent, the title, the description and the eyebrow label beside a phone.
   Phone first on narrow screens, then text; from 1024px it sits beside the text
   and `flip` alternates which side. Layout lives in globals.css (.fc-*). */
export default function FeatureCard({
  n,
  title,
  body,
  eyebrow,
  screen,
  tint = "#1E1B4B",
  flip = false,
}: {
  n: string;
  title: string;
  body: string;
  eyebrow: string;
  screen: string;
  tint?: string;
  flip?: boolean;
}) {
  const reduced = useReducedMotion();
  const rise = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -12% 0px" },
    transition: { type: "spring" as const, bounce: 0, duration: 0.55 },
  };

  return (
    <article className={flip ? "fc fc-flip" : "fc"} aria-label={`${n} ${eyebrow}`}>
      <motion.div className="fc-phone" {...rise}>
        <PhoneFrame
          screen={{ image: screen, label: `FitVerse ${eyebrow}`, tint }}
          width="clamp(200px, 60vw, 262px)"
        />
      </motion.div>

      <motion.div className="fc-text" {...rise}>
        <span
          className="block leading-none select-none"
          style={{
            fontFamily: "var(--font-head)", fontSize: 44, fontWeight: 600,
            color: ACCENT, letterSpacing: "-0.03em", marginBottom: 16,
          }}
        >
          {n}
        </span>
        <h3
          style={{
            fontFamily: "var(--font-head)", fontSize: "clamp(24px, 6.4vw, 30px)", fontWeight: 600,
            color: INK, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 14,
            textWrap: "balance",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 15.5,
            color: INK_DIM, lineHeight: 1.55, maxWidth: "42ch",
          }}
        >
          {body}
        </p>
        <p className="t-eyebrow" style={{ color: ACCENT, marginTop: 18 }}>
          {eyebrow}
        </p>
      </motion.div>
    </article>
  );
}
