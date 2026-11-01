"use client";

/* The Features page body: a hero band (the home hero's treatment, shorter), the
   seven modules as the home page's feature cards on cream, and the day slider
   on a cream card. Copy is unchanged from the previous version of this page. */

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { ramp } from "@/lib/gradients";
import FeatureCard from "@/components/FeatureCard";
import PhoneFrame from "@/components/ui/PhoneFrame";
import { spring } from "@/lib/motion";
import { ACCENT, INK, INK_DIM } from "@/lib/tokens";

type Module = {
  id: string;
  n: string;
  name: string;
  line: string;
  body: string;
  screen: string;
};

/* Deliberately not the homepage's taglines. The homepage says what each module
   is; these say what each one does to the others. */
const MODULES: Module[] = [
  {
    id: "coach", n: "01", name: "AI Coach",
    line: "It reads the other six.",
    body: "Every plan it writes starts from what the rest of your week already said — not from a template you picked on day one.",
    screen: "/screen-ai-coach.webp",
  },
  {
    id: "nutrition", n: "02", name: "Nutrition",
    line: "A meal is never just a meal.",
    body: "Scan it, log it, and it lands in the same picture as your training load and your recovery, where it can actually mean something.",
    screen: "/screen-diary.webp",
  },
  {
    id: "workout", n: "03", name: "Workout",
    line: "Sessions that know what kind of week you've had.",
    body: "Sets, reps and load, tracked against history — and scaled to the body that turned up today rather than the one that planned it.",
    screen: "/screen-active-logger.webp",
  },
  {
    id: "sleep", n: "04", name: "Sleep",
    line: "The input that changes everything downstream.",
    body: "Quality, duration, and what it costs you tomorrow. This is the module the other six listen to hardest.",
    screen: "/screen-sleep.webp",
  },
  {
    id: "wellness", n: "05", name: "Wellness",
    line: "The part most trackers leave out.",
    body: "Mood check-ins and guided sessions, logged where the rest of you already lives instead of in a seventh app.",
    screen: "/screen-wellness.webp",
  },
  {
    id: "community", n: "06", name: "Community",
    line: "Accountability that doesn't live somewhere else.",
    body: "Challenges, leaderboards and people chasing the same thing — attached to the training you're actually logging.",
    screen: "/screen-community.webp",
  },
  {
    id: "women", n: "07", name: "Women",
    line: "Made Just for the Girls.",
    body: "Track your cycle, not just your workouts. Built to help women make confident decisions about their health.",
    screen: "/screen-cycle.webp",
  },
];

/* Four moments in one Tuesday, each caused by the one before. */
type Moment = {
  time: string;
  node: string;
  head: string;
  read: string;
  because: string | null;
  screen: string;
};

const TUESDAY: Moment[] = [
  {
    time: "07:00", node: "Sleep", head: "A short night",
    read: "6h 52m · quality 82",
    because: null,
    screen: "/screen-sleep.webp",
  },
  {
    time: "09:00", node: "AI Coach", head: "The day rewrites itself",
    read: "Today's plan adjusted",
    because: "because you slept 68 minutes short",
    screen: "/screen-ai-coach.webp",
  },
  {
    time: "13:00", node: "Nutrition", head: "Lunch lands",
    read: "1,190 kcal left",
    because: "protein target raised to protect recovery",
    screen: "/screen-diary.webp",
  },
  {
    time: "18:00", node: "Workout", head: "Lighter than planned",
    read: "Volume scaled back",
    because: "traced all the way to 07:00",
    screen: "/screen-active-logger.webp",
  },
];

/* ── Header: one orange-to-cream gradient on one element ─────────────────────
   Brand orange at the very top (behind the glass navbar), melting through the
   home hero's oranges and a pale peach into the page cream, reaching full cream
   a short way under the paragraph. A single linear-gradient: no canvas, grid,
   overlay, border or shadow. The colours are the shared orange tokens in
   globals.css, the same ones the home hero's glow reads. */
const HEADER_BG = ramp(
  [
    ["var(--o-900)", 0],
    ["var(--o-700)", 0.15],
    ["var(--orange)", 0.4],
    ["var(--orange-bright)", 0.62],
    ["var(--orange-glow)", 0.78],
    ["var(--peach)", 0.9],
    ["var(--page-bg)", 1],
  ],
  4,
);

function FeaturesHeader() {
  return (
    <header className="fx-head" data-nav-dark style={{ background: HEADER_BG }}>
      <h1 className="fx-title">
        Seven modules. <span>One line.</span>
      </h1>
      <p className="fx-sub">That connection is the product. Everything else is table stakes.</p>
    </header>
  );
}

/* ── One Tuesday ─────────────────────────────────────────────────────────── */
const CARD_STYLE = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-light)",
  borderRadius: 20,
  boxShadow: "0 20px 50px rgba(26,21,18,0.08), 0 3px 10px rgba(26,21,18,0.05)",
} as const;

function Tuesday() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [step, setStep] = useState(0);

  /* Bucket, not frame: state changes four times across the whole drag. */
  useMotionValueEvent(x, "change", (v) => {
    const w = trackRef.current?.offsetWidth ?? 1;
    const next = Math.min(TUESDAY.length - 1, Math.max(0, Math.round((v / Math.max(w - 44, 1)) * (TUESDAY.length - 1))));
    setStep((p) => (p === next ? p : next));
  });

  const jump = useCallback((i: number) => {
    const w = trackRef.current?.offsetWidth ?? 1;
    x.set((i / (TUESDAY.length - 1)) * Math.max(w - 44, 1));
    setStep(i);
  }, [x]);

  const m = TUESDAY[step];
  /* Declared before the reduced-motion return below: a hook after a
     conditional return is a hook that sometimes does not run. */
  const fillW = useTransform(x, (v) => v + 22);

  /* Reduced motion gets the argument as a static chain — same copy, no drag. */
  if (reduced) {
    return (
      <section className="fc-section" aria-labelledby="tuesday-heading">
        <div className="fc-wrap">
          <div style={{ ...CARD_STYLE, padding: "clamp(24px, 5vw, 48px)" }}>
            <h2 id="tuesday-heading" className="t-section-title" style={{ color: INK, marginBottom: 10, textWrap: "balance" }}>
              One Tuesday, end to end.
            </h2>
            <p style={{ color: INK_DIM, fontSize: 16, lineHeight: 1.55, maxWidth: "46ch", marginBottom: 28 }}>
              Each of these happened because of the one above it.
            </p>
            <ol style={{ display: "grid", gap: 18, listStyle: "none", padding: 0 }}>
              {TUESDAY.map((t) => (
                <li key={t.time} style={{ borderTop: "1px solid var(--border-light)", paddingTop: 18 }}>
                  <p className="t-eyebrow" style={{ color: ACCENT }}>{t.time} · {t.node}</p>
                  <p style={{ color: INK, fontSize: "1.3rem", fontWeight: 600, margin: "6px 0 4px", fontFamily: "var(--font-head)" }}>{t.head}</p>
                  <p style={{ color: INK_DIM, fontSize: "0.98rem" }}>{t.read}{t.because ? ` — ${t.because}` : ""}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fc-section" aria-labelledby="tuesday-heading">
      <div className="fc-wrap">
        <div style={{ ...CARD_STYLE, padding: "clamp(24px, 5vw, 56px)" }}>
          <h2 id="tuesday-heading" className="t-section-title" style={{ color: INK, marginBottom: 10, textWrap: "balance" }}>
            One Tuesday. Drag it.
          </h2>
          <p style={{ color: INK_DIM, fontSize: 16, lineHeight: 1.55, maxWidth: "46ch", marginBottom: 28 }}>
            You&rsquo;re not scrubbing a video. You&rsquo;re scrubbing cause and effect.
          </p>

          <div className="tuesday-grid">
            <div style={{ width: "100%", maxWidth: 460 }}>
              <motion.p
                key={`${m.time}-t`}
                className="t-eyebrow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                style={{ color: ACCENT, marginBottom: 10 }}
              >
                {m.time} · {m.node}
              </motion.p>
              <motion.p
                key={`${m.time}-h`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                style={{ fontFamily: "var(--font-head)", color: INK, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.08 }}
              >
                {m.head}
              </motion.p>
              <motion.p
                key={`${m.time}-r`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...spring, delay: 0.04 }}
                style={{ color: INK, fontSize: 16, marginTop: 14, fontWeight: 500 }}
              >
                {m.read}
              </motion.p>
              {m.because && (
                <motion.p
                  key={`${m.time}-b`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.08 }}
                  style={{ color: INK_DIM, fontSize: 15, marginTop: 8, lineHeight: 1.55 }}
                >
                  ↳ {m.because}
                </motion.p>
              )}
            </div>

            <motion.div
              key={m.screen}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              style={{ justifySelf: "center" }}
            >
              <PhoneFrame
                screen={{ image: m.screen, label: `${m.node} at ${m.time}`, tint: "#1E1B4B" }}
                width="clamp(170px, 46vw, 210px)"
              />
            </motion.div>
          </div>

          {/* The thread, laid horizontal — and the handle that runs along it */}
          <div style={{ marginTop: 32 }}>
            <div ref={trackRef} style={{ position: "relative", height: 44 }}>
              <div aria-hidden="true" style={{
                position: "absolute", left: 0, right: 0, top: 21, height: 2,
                background: "var(--border-light)", borderRadius: 2,
              }} />
              <motion.div aria-hidden="true" style={{
                position: "absolute", left: 0, top: 21, height: 2,
                background: ACCENT, borderRadius: 2, width: fillW,
              }} />
              {TUESDAY.map((t, i) => (
                <button
                  key={t.time}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`${t.time} — ${t.head}`}
                  style={{
                    position: "absolute", top: 12, width: 20, height: 20, padding: 0,
                    left: `calc(${(i / (TUESDAY.length - 1)) * 100}% - 10px)`,
                    borderRadius: "50%", border: "none", cursor: "pointer",
                    background: i <= step ? ACCENT : "rgba(26,21,18,0.22)",
                    transform: "scale(0.42)", transition: "background 0.25s ease",
                  }}
                />
              ))}
              <motion.div
                drag="x"
                dragConstraints={trackRef}
                dragElastic={0.04}
                dragMomentum={false}
                style={{
                  x, position: "absolute", top: 0, left: 0,
                  width: 44, height: 44, borderRadius: "50%",
                  background: ACCENT, cursor: "grab", touchAction: "none",
                  boxShadow: "0 6px 20px rgba(168,61,11,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                whileDrag={{ cursor: "grabbing", scale: 1.06 }}
                role="slider"
                aria-label="Time of day"
                aria-valuemin={0}
                aria-valuemax={TUESDAY.length - 1}
                aria-valuenow={step}
                aria-valuetext={`${m.time} — ${m.head}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") jump(Math.min(TUESDAY.length - 1, step + 1));
                  if (e.key === "ArrowLeft") jump(Math.max(0, step - 1));
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3L3 8l3 5M10 3l3 5-3 5" stroke="#FDFCF9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
            <p className="t-eyebrow" style={{ color: INK_DIM, marginTop: 14 }}>
              Drag across the day
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Page body ───────────────────────────────────────────────────────────── */
export default function FeaturesContent() {
  return (
    <>
      <FeaturesHeader />

      <section className="fc-section fc-modules" aria-label="The seven modules">
        <div className="fc-wrap fc-list">
          {MODULES.map((mod, i) => (
            <FeatureCard
              key={mod.id}
              n={mod.n}
              title={mod.line}
              body={mod.body}
              eyebrow={mod.name}
              screen={mod.screen}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </section>

      <Tuesday />
    </>
  );
}
