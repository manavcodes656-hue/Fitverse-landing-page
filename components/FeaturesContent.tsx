"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   ONE THREAD — the Features section.

   The homepage names the seven modules. This page proves the claim underneath
   them: that they are not seven things but seven points on one line. A single
   accent hairline is drawn by the user's own scroll, passes through every
   module, turns horizontal for one pinned act where the visitor drags a day
   back and forth and watches modules react to each other, then collapses to a
   point.

   Rules this file holds to:
     · Only transform and opacity animate per frame. Blur and shadow are set
       per state, never tweened — they force paint.
     · React re-renders only when a bucket changes, never per frame.
     · Motion is scroll- or drag-linked, so it answers the user rather than
       playing on a timer.
     · Critically damped everywhere except the final convergence, which is the
       one moment where elements were genuinely thrown together.
   ────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  useMotionValue,
} from "framer-motion";
import { reveal, spring } from "@/lib/motion";

/* ── Palette (existing tokens only) ──────────────────────────────────────── */
const GROUND = "#0F0D0A";
const PAPER = "#FDFCF9";
const DIM = "rgba(253,252,249,0.60)";
const FAINT = "rgba(253,252,249,0.14)";
/* The lighter accent, because everything here sits on a dark ground. */
const THREAD = "#D9702F";

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

/* The pinned act. Four moments in one Tuesday, each caused by the one before. */
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

/* ── Overture ────────────────────────────────────────────────────────────── */
function Overture() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  /* The first line recedes rather than fades: it goes back in Z and dims, so
     the second line arrives in front of it instead of replacing it. */
  const firstZ = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const firstO = useTransform(scrollYProgress, [0, 0.7], [1, 0.12]);

  const WORD = "One system.".split("");

  return (
    <div ref={ref} style={{ height: "150vh", position: "relative" }}>
      {/* Top-left, not centered: the heading opens the section like a page
          title, and everything below flows down from it. Left padding matches
          the rail so the whole section shares one left edge. */}
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        justifyContent: "flex-start", gap: 6,
        padding: "clamp(104px, 16vh, 168px) clamp(20px, 6vw, 80px) 0",
        textAlign: "left",
      }}>
        <motion.h1
          style={{
            fontSize: "clamp(2.4rem, 8vw, 6rem)",
            fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
            color: PAPER,
            ...(reduced ? {} : { scale: firstZ, opacity: firstO }),
          }}
        >
          Seven modules.
        </motion.h1>

        {/* Letters rise from under a mask, ~18ms apart. Kinetic type doing the
            work a fade would only gesture at. */}
        <span style={{ overflow: "hidden", display: "flex", paddingBottom: "0.12em" }} aria-label="One system.">
          {WORD.map((c, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={reduced ? { opacity: 0 } : { y: "110%" }}
              whileInView={reduced ? { opacity: 1 } : { y: 0 }}
              viewport={{ once: true }}
              transition={reduced ? { duration: 0.3 } : { ...spring, delay: i * 0.018 }}
              style={{
                display: "inline-block",
                fontSize: "clamp(2.4rem, 8vw, 6rem)",
                fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
                color: THREAD,
                whiteSpace: "pre",
              }}
            >
              {c}
            </motion.span>
          ))}
        </span>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ...reveal, delay: 0.5 }}
          style={{ color: DIM, fontSize: "clamp(0.95rem, 1.7vw, 1.1rem)", maxWidth: "36ch", marginTop: 18, lineHeight: 1.6 }}
        >
          Follow the line down. It doesn&rsquo;t break once.
        </motion.p>
      </div>
    </div>
  );
}

/* ── One module node ─────────────────────────────────────────────────────── */
function Node({ mod, i }: { mod: Module; i: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.32"] });

  const o = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const dot = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);
  /* Counter-drift: the screen moves slower than the page, so it reads as
     sitting behind the type rather than pasted onto it. */
  const drift = useTransform(scrollYProgress, [0, 1], [64, -18]);
  const tilt = useTransform(scrollYProgress, [0, 1], [i % 2 ? -9 : 9, 0]);

  const flip = i % 2 === 1;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(20px, 6vw, 80px)",
      }}
    >
      {/* Node marker, sitting on the thread */}
      <motion.span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "clamp(20px, 6vw, 80px)",
          top: "50%",
          width: 11, height: 11, borderRadius: "50%",
          background: THREAD,
          marginTop: -5, marginLeft: -5,
          zIndex: 2,
          boxShadow: `0 0 0 6px ${GROUND}, 0 0 26px ${THREAD}`,
          ...(reduced ? {} : { scale: dot, opacity: o }),
        }}
      />

      <motion.div
        className="mx-auto w-full"
        style={{
          maxWidth: 1180,
          display: "grid",
          gap: "clamp(28px, 5vw, 72px)",
          alignItems: "center",
          ...(reduced ? { opacity: 1 } : { opacity: o, y }),
        }}
      >
        <div
          className={flip ? "node-grid node-grid-flip" : "node-grid"}
          style={{ display: "grid", gap: "clamp(28px, 5vw, 72px)", alignItems: "center" }}
        >
          {/* Order and width live in the stylesheet, not inline: on mobile the
              text always comes first and the screen sizes to the viewport;
              the alternating left/right rhythm only exists at desktop widths. */}
          <div className="node-text" style={{ paddingLeft: "clamp(26px, 4vw, 54px)" }}>
            <p style={{ color: THREAD, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 16 }}>
              {mod.n}
            </p>
            <h2 style={{
              color: PAPER, fontWeight: 700,
              fontSize: "clamp(1.9rem, 4.4vw, 3.4rem)",
              lineHeight: 1.03, letterSpacing: "-0.032em", marginBottom: 18,
              textWrap: "balance",
            }}>
              {mod.line}
            </h2>
            <p style={{ color: DIM, fontSize: "clamp(0.95rem, 1.7vw, 1.075rem)", lineHeight: 1.65, maxWidth: "44ch" }}>
              {mod.body}
            </p>
            <p style={{ color: FAINT, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 22 }}>
              {mod.name}
            </p>
          </div>

          <motion.div
            className="node-screen"
            style={{
              justifySelf: "center",
              perspective: 1200,
              ...(reduced ? {} : { y: drift }),
            }}
          >
            <motion.div
              style={{
                borderRadius: "clamp(22px, 3vw, 30px)",
                overflow: "hidden",
                background: "#0A0A0A",
                boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
                ...(reduced ? {} : { rotateY: tilt }),
              }}
            >
              <Image
                src={mod.screen}
                alt={`FitVerse ${mod.name}`}
                width={390}
                height={844}
                sizes="(max-width: 768px) 60vw, 268px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── The pinned act ──────────────────────────────────────────────────────── */
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
  /* Declared before the reduced-motion early return below: a hook after a
     conditional return is a hook that sometimes does not run. */
  const fillW = useTransform(x, (v) => v + 22);

  /* Reduced motion gets the argument as a static chain — same copy, no drag. */
  if (reduced) {
    return (
      <section style={{ padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)" }} aria-labelledby="tuesday-heading">
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2 id="tuesday-heading" style={{ color: PAPER, fontSize: "clamp(1.9rem, 4.4vw, 3.4rem)", fontWeight: 700, letterSpacing: "-0.032em", marginBottom: 12 }}>
            One Tuesday, end to end.
          </h2>
          <p style={{ color: DIM, fontSize: "1.05rem", lineHeight: 1.65, maxWidth: "52ch", marginBottom: 40 }}>
            Each of these happened because of the one above it.
          </p>
          <ol style={{ display: "grid", gap: 18 }}>
            {TUESDAY.map((t) => (
              <li key={t.time} style={{ borderTop: `1px solid ${FAINT}`, paddingTop: 18 }}>
                <p style={{ color: THREAD, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em" }}>{t.time} · {t.node}</p>
                <p style={{ color: PAPER, fontSize: "1.3rem", fontWeight: 600, margin: "6px 0 4px" }}>{t.head}</p>
                <p style={{ color: DIM, fontSize: "0.98rem" }}>{t.read}{t.because ? ` — ${t.because}` : ""}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section style={{ height: "260vh", position: "relative" }} aria-labelledby="tuesday-heading">
      <div style={{ position: "sticky", top: 0, height: "100svh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px, 6vw, 80px)" }}>
          <h2 id="tuesday-heading" style={{
            color: PAPER, fontSize: "clamp(1.7rem, 4vw, 3rem)", fontWeight: 700,
            letterSpacing: "-0.032em", marginBottom: 8, textWrap: "balance",
          }}>
            One Tuesday. Drag it.
          </h2>
          <p style={{ color: DIM, fontSize: "clamp(0.92rem, 1.6vw, 1.05rem)", marginBottom: "clamp(24px, 4vh, 44px)", maxWidth: "46ch" }}>
            You&rsquo;re not scrubbing a video. You&rsquo;re scrubbing cause and effect.
          </p>

          <div style={{
            display: "grid", gap: "clamp(22px, 4vw, 56px)", alignItems: "center",
          }} className="tuesday-grid">
            {/* The reading */}
            <div style={{ order: 1, width: "100%", maxWidth: 460 }}>
              <motion.p
                key={`${m.time}-t`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                style={{ color: THREAD, fontWeight: 700, fontSize: 13, letterSpacing: "0.14em", marginBottom: 10 }}
              >
                {m.time} · {m.node}
              </motion.p>
              <motion.p
                key={`${m.time}-h`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                style={{ color: PAPER, fontSize: "clamp(1.5rem, 3.4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08 }}
              >
                {m.head}
              </motion.p>
              <motion.p
                key={`${m.time}-r`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...spring, delay: 0.04 }}
                style={{ color: PAPER, fontSize: "clamp(1rem, 1.9vw, 1.2rem)", marginTop: 14, fontWeight: 600 }}
              >
                {m.read}
              </motion.p>
              {m.because && (
                <motion.p
                  key={`${m.time}-b`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.08 }}
                  style={{ color: DIM, fontSize: "0.95rem", marginTop: 8, lineHeight: 1.6 }}
                >
                  ↳ {m.because}
                </motion.p>
              )}
            </div>

            {/* The screen. Sized off viewport HEIGHT, not width: this sits in a
                pinned 100vh frame, so a width-derived phone is what overflows
                it on a short window. */}
            <div style={{ order: 2 }}>
              <motion.div
                key={m.screen}
                className="tuesday-screen"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring}
                style={{
                  aspectRatio: "390 / 844",
                  borderRadius: "clamp(18px, 2.4vw, 26px)", overflow: "hidden",
                  background: "#0A0A0A", boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
                }}
              >
                <Image
                  src={m.screen}
                  alt={`${m.node} at ${m.time}`}
                  width={390}
                  height={844}
                  sizes="(max-width: 820px) 40vh, 200px"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </motion.div>
            </div>
          </div>

          {/* The thread, laid horizontal — and the handle that runs along it */}
          <div style={{ marginTop: "clamp(26px, 5vh, 54px)" }}>
            <div ref={trackRef} style={{ position: "relative", height: 44 }}>
              <div aria-hidden="true" style={{
                position: "absolute", left: 0, right: 0, top: 21, height: 2,
                background: FAINT, borderRadius: 2,
              }} />
              <motion.div aria-hidden="true" style={{
                position: "absolute", left: 0, top: 21, height: 2,
                background: THREAD, borderRadius: 2,
                width: fillW,
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
                    background: i <= step ? THREAD : "rgba(253,252,249,0.22)",
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
                  background: PAPER, cursor: "grab", touchAction: "none",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
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
                  <path d="M6 3L3 8l3 5M10 3l3 5-3 5" stroke={GROUND} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
            <p style={{ color: FAINT, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 14 }}>
              Drag across the day
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */
export default function FeaturesContent() {
  const reduced = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 0.9", "end 0.15"] });

  return (
    <div style={{ background: GROUND, overflowX: "clip" }}>
      <style>{`
        /* Layout lives here, never in an inline style: an inline
           grid-template-columns outranks a media query and silently pins the
           act to one column on desktop, which then overflows the pinned
           viewport and gets clipped. */
        .tuesday-grid { grid-template-columns: 1fr; justify-items: center; }

        /* Mobile: single column, text before screen regardless of the desktop
           flip, screen sized to the viewport so it never overflows, and the
           pinned Tuesday phone kept short enough that heading + reading +
           slider all fit inside one 100svh frame on a small phone. */
        .node-text { order: 1; }
        .node-screen { order: 2; width: min(62vw, 240px); }
        .tuesday-screen { height: min(30vh, 300px); }

        @media (min-width: 820px) {
          .node-grid { grid-template-columns: 1fr 1fr; }
          .node-screen { width: clamp(190px, 26vw, 268px); }
          .node-grid-flip .node-text { order: 2; }
          .node-grid-flip .node-screen { order: 1; }
          .tuesday-screen { height: min(42vh, 400px); }
          .tuesday-grid { grid-template-columns: 1.15fr 0.85fr; justify-items: start; }
          .tuesday-grid > div:last-child { justify-self: end; }
        }
      `}</style>

      <Overture />

      {/* The rail: one hairline, drawn by the reader's own scroll, never broken */}
      <div ref={railRef} style={{ position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, bottom: 0,
            left: "clamp(20px, 6vw, 80px)", width: 2,
            background: FAINT,
          }}
        />
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, bottom: 0,
            left: "clamp(20px, 6vw, 80px)", width: 2,
            background: `linear-gradient(180deg, ${THREAD}, ${THREAD})`,
            transformOrigin: "top",
            scaleY: reduced ? 1 : scrollYProgress,
          }}
        />
        {MODULES.map((mod, i) => (
          <Node key={mod.id} mod={mod} i={i} />
        ))}
      </div>

      <Tuesday />
    </div>
  );
}
