"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimationFrame,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   INTRO ANIMATION
   Seven drifting modules gather, collapse into one, and resolve as FitVerse.
   Whole sequence, first frame to homepage revealed: 5.00s.

   ── SWAPPING IN REAL ASSETS ─────────────────────────────────────────────────
   Everything visual is in INTRO_ICONS below. Set `icon` to any JSX node
   (<Image />, inline <svg>, anything) and the placeholder shape is ignored —
   it is rendered inside a box of size GLYPH, so a 1:1 asset needs no wrapper.
   `x`/`y` are the resting offsets in units of the responsive spread radius,
   so the scatter stays proportional on every screen size. Animation logic
   never reads anything else from this array.
   ═══════════════════════════════════════════════════════════════════════════ */

export type IntroIcon = {
  id: string;
  label: string;
  tint: string;
  ink: string;
  /** Resting offset from centre, in multiples of the spread radius (-1…1). */
  x: number;
  y: number;
  /** Drift speed multiplier — small variations stop them moving as one body. */
  drift: number;
  /** Real asset goes here. */
  icon?: React.ReactNode;
};

export const INTRO_ICONS: IntroIcon[] = [
  { id: "workouts",     label: "Workouts",     tint: "#1E1B4B", ink: "#A5B4FC", x: -0.82, y: -0.46, drift: 1.00 },
  { id: "nutrition",    label: "Nutrition",    tint: "#064E3B", ink: "#6EE7B7", x:  0.74, y: -0.62, drift: 1.24 },
  { id: "sleep",        label: "Sleep",        tint: "#2E1065", ink: "#C4B5FD", x:  0.96, y:  0.28, drift: 0.86 },
  { id: "activity",     label: "Activity",     tint: "#5C1520", ink: "#E8A0AE", x:  0.34, y:  0.78, drift: 1.12 },
  { id: "community",    label: "Community",    tint: "#0C4A6E", ink: "#7DD3FC", x: -0.52, y:  0.72, drift: 0.94 },
  { id: "gamification", label: "Gamification", tint: "#8C2F3D", ink: "#F2B8C4", x: -1.02, y:  0.16, drift: 1.32 },
  { id: "ai-coach",     label: "AI Coach",     tint: "#3B0764", ink: "#E9D5FF", x:  0.10, y: -0.94, drift: 0.78 },
];

/* ── Scale ──────────────────────────────────────────────────────────────────
   Everything sizes off the viewport's smaller edge (vmin), so the composition
   holds its proportions from a 360px phone to a 27" display instead of
   becoming a cluster of small objects marooned in a large empty screen.     */
const TILE  = "clamp(62px, 8.5vmin, 88px)";
const GLYPH = "clamp(26px, 3.6vmin, 38px)";
const RADIUS_MIN = 130;
const RADIUS_MAX = 300;

/* ── Timing ─────────────────────────────────────────────────────────────────
   Budget: 5.00s, first frame to homepage revealed.

     0 – 2000   float.   Each module on its own orbit, nothing synchronised.
                         Long enough to actually read all seven labels.
  2000 – 2400   gather.  They ease outward ~12% — anticipation, so the
                         collapse that follows reads as a pull, not a cut.
  2400 – 3500   merge.   Slow, low-stiffness springs to centre, 100ms apart.

                         Each module fades out at roughly 85% of its travel.
                         That is deliberate: with a 100ms stagger the last
                         module does not begin until 3.0s, and a spring soft
                         enough to decelerate visibly would still be settling
                         past 3.8s — well into the logo's hold. Fading before
                         the settle means you see the deceleration and never
                         see the stop, and the wordmark gets a clean stage.

  3500 – 4500   logo.    FITVERSE resolves and holds a full second.
  4500 – 5000   dissolve. Wordmark eases forward, overlay fades, homepage —
                         mounted underneath the whole time — is uncovered.  */
const T = {
  gather: 2000,
  merge: 2400,
  logo: 3500,
  dissolve: 4500,
  done: 4560,
} as const;

/* Reduced motion: no drift, no gather, no merge, no travel of any kind — the
   wordmark simply fades in, holds, and fades out. Kept short; there is
   nothing to watch, so there is no reason to make anyone wait 5 seconds.   */
const T_REDUCED = {
  gather: 0,
  merge: 0,
  logo: 0,
  dissolve: 900,
  done: 1000,
} as const;

const SESSION_KEY = "fitverse:intro-seen";

type Phase = "float" | "gather" | "merge" | "logo" | "dissolve";

/* ── One floating module ─────────────────────────────────────────────────────
   Two independent layers. The outer element springs between its three scatter
   states; the inner element carries a continuous sine drift that damps to zero
   the moment the gather begins. Keeping them separate means the ambient motion
   never fights the spring, and the spring always starts from wherever the
   element actually is on screen (§3 — animate from the presentation value).

   Drift frequencies sit around 0.28–0.45 Hz. Deliberately clear of the ~0.2 Hz
   band the skill flags as vestibularly uncomfortable (§14).                  */
function FloatingIcon({
  item,
  index,
  radius,
  stage,
  clock,
}: {
  item: IntroIcon;
  index: number;
  radius: number;
  stage: "float" | "gather" | "merge";
  clock: MotionValue<number>;
}) {
  const seed = index * 1.7;
  const amp = stage === "merge" ? 0 : 1;

  const driftX = useTransform(clock, (t) => Math.sin(t * 2.10 * item.drift + seed) * 14 * amp);
  const driftY = useTransform(clock, (t) => Math.cos(t * 1.75 * item.drift + seed * 1.3) * 16 * amp);
  const driftR = useTransform(clock, (t) => Math.sin(t * 1.30 * item.drift + seed * 0.7) * 2.8 * amp);

  const target =
    stage === "merge"
      ? { x: 0, y: 0, opacity: 0, scale: 0.14 }
      : stage === "gather"
        ? { x: item.x * radius * 1.12, y: item.y * radius * 1.12, opacity: 1, scale: 0.96 }
        : { x: item.x * radius, y: item.y * radius, opacity: 1, scale: 1 };

  const transition =
    stage === "merge"
      ? {
          /* Long and critically damped. A slow spring decelerates for most of
             its travel, which is the whole point here — they should ease into
             the centre, not arrive and stop. No overshoot: seven things
             converging on one point cannot afford to smear through it. */
          type: "spring" as const,
          bounce: 0,
          duration: 0.9,
          delay: index * 0.1,
          /* Gone at ~85% of the travel. See the timing note above. */
          opacity: { duration: 0.42, delay: 0.06 + index * 0.1, ease: "easeIn" as const },
        }
      : stage === "gather"
        ? { type: "spring" as const, bounce: 0, duration: 0.45, delay: index * 0.02 }
        : { type: "spring" as const, bounce: 0, duration: 0.7, delay: index * 0.055 };

  return (
    <motion.div
      initial={{ x: item.x * radius, y: item.y * radius, opacity: 0, scale: 0.86 }}
      animate={target}
      transition={transition}
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(8px, 1.2vmin, 13px)",
        willChange: "transform, opacity",
      }}
    >
      <motion.div
        style={{
          x: driftX,
          y: driftY,
          rotate: driftR,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(8px, 1.2vmin, 13px)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: TILE,
            height: TILE,
            borderRadius: "clamp(16px, 2.2vmin, 23px)",
            background: item.tint,
            border: `1px solid ${item.ink}38`,
            boxShadow: "0 10px 34px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.13)",
          }}
        >
          {item.icon ?? (
            <span
              aria-hidden="true"
              style={{
                width: GLYPH,
                height: GLYPH,
                borderRadius: "clamp(7px, 1vmin, 11px)",
                border: `1.5px solid ${item.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.ink,
                fontSize: "clamp(13px, 1.8vmin, 18px)",
                fontWeight: 700,
              }}
            >
              {item.label.charAt(0)}
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: "clamp(11px, 1.5vmin, 14px)",
            fontWeight: 600,
            letterSpacing: "0.015em",
            color: "rgba(255,255,255,0.72)",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function IntroAnimation({
  /** Set false while reviewing so it replays on every mount. */
  oncePerSession = true,
  onDone,
}: {
  oncePerSession?: boolean;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("float");
  const [radius, setRadius] = useState(200);
  const [skipped, setSkipped] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);

  /* Elapsed seconds, shared by every drifting module. One rAF loop, not seven. */
  const clock = useMotionValue(0);
  useAnimationFrame((t) => {
    if (visible && !reduced) clock.set(t / 1000);
  });

  /* Before paint, so a returning visitor never sees a frame of this. */
  useLayoutEffect(() => {
    if (!oncePerSession) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setVisible(false);
        finished.current = true;
      }
    } catch {
      /* storage blocked — show it */
    }
  }, [oncePerSession]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
    onDone?.();
  }, [onDone]);

  /* Tap anywhere, or any key, goes straight to the site. Five seconds is a
     long time to hold someone away from what they came for — the escape
     hatch has to be real, and it has to be visible (§16.2 Agency). */
  const skip = useCallback(() => {
    setSkipped(true);
    setPhase("dissolve");
    finish();
  }, [finish]);

  useEffect(() => {
    if (!visible || finished.current) return;

    const size = () => {
      const base = Math.min(window.innerWidth, window.innerHeight);
      setRadius(Math.max(RADIUS_MIN, Math.min(base * 0.34, RADIUS_MAX)));
    };
    size();
    window.addEventListener("resize", size);

    const t = reduced ? T_REDUCED : T;
    timers.current = [
      setTimeout(() => setPhase("gather"), t.gather),
      setTimeout(() => setPhase("merge"), t.merge),
      setTimeout(() => setPhase("logo"), t.logo),
      setTimeout(() => setPhase("dissolve"), t.dissolve),
      setTimeout(finish, t.done),
    ];

    /* Any intent to use the site dismisses the splash. Previously only a
       keypress did — so a visitor who reached for the nav sat through the full
       4.5s with every control dead under an overlay, with no way out that they
       would ever guess. A click, a tap or a scroll all mean "I'm ready". */
    const onSkip = () => skip();
    document.addEventListener("keydown", onSkip);
    document.addEventListener("pointerdown", onSkip);
    document.addEventListener("wheel", onSkip, { passive: true });
    document.addEventListener("touchstart", onSkip, { passive: true });

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", size);
      document.removeEventListener("keydown", onSkip);
      document.removeEventListener("pointerdown", onSkip);
      document.removeEventListener("wheel", onSkip);
      document.removeEventListener("touchstart", onSkip);
      timers.current.forEach(clearTimeout);
      document.body.style.overflow = prev;
    };
  }, [visible, reduced, finish, skip]);

  const stage: "float" | "gather" | "merge" =
    phase === "float" ? "float" : phase === "gather" ? "gather" : "merge";
  const showLogo = phase === "logo" || phase === "dissolve";
  const dissolving = phase === "dissolve";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          /* Decorative and short-lived — a screen reader should get the page,
             not a countdown it cannot act on. */
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: skipped ? 0.2 : reduced ? 0.25 : 0.44, ease: "easeOut" }}
          className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden"
          style={{
            /* A quiet vignette rather than flat black: it pushes the centre
               forward and keeps the tiles reading as lit objects, without
               becoming a texture that competes with them. */
            background:
              "radial-gradient(120% 120% at 50% 46%, #1A1512 0%, #0F0D0A 46%, #070605 100%)",
            /* Transparent to input. It used to swallow the click that dismissed
               it, so the first click cost you nothing but the splash and you
               had to aim again. Now the document-level listeners dismiss it
               while that same click reaches whatever you were aiming at. */
            pointerEvents: "none",
          }}
        >
          {/* Bloom swells as the modules land, then opens out on the dissolve. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.62 }}
            animate={{
              opacity: dissolving ? 0.5 : showLogo ? 1 : 0.28,
              scale: dissolving ? 1.16 : showLogo ? 1 : 0.78,
            }}
            transition={{ type: "spring", bounce: 0, duration: dissolving ? 0.7 : 0.75 }}
            style={{
              position: "absolute",
              width: "min(96vmin, 760px)",
              height: "min(96vmin, 760px)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(217,112,47,0.20) 0%, transparent 66%)",
              pointerEvents: "none",
            }}
          />

          {!reduced &&
            INTRO_ICONS.map((item, i) => (
              <FloatingIcon
                key={item.id}
                item={item}
                index={i}
                radius={radius}
                stage={stage}
                clock={clock}
              />
            ))}

          {/* ── FITVERSE ──
              Roughly four times the tile size. The destination should not be
              the same weight as the things that travelled to reach it. */}
          <motion.div
            initial={{ scale: reduced ? 0.98 : 0.62, opacity: 0 }}
            animate={
              reduced
                ? { scale: 1, opacity: 1 }
                : {
                    /* Eases forward on the dissolve, so the overlay reads as
                       receding rather than merely switching off. */
                    scale: dissolving ? 1.05 : showLogo ? 1 : 0.62,
                    opacity: showLogo ? 1 : 0,
                  }
            }
            transition={
              reduced
                ? { duration: 0.25, ease: "easeOut" }
                : dissolving
                  ? { type: "spring", bounce: 0, duration: 0.8 }
                  : /* Barely-there overshoot — enough to register as an arrival,
                       far short of anything that reads as springy. */
                    { type: "spring", bounce: 0.12, duration: 0.7 }
            }
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "clamp(12px, 1.8vmin, 20px)",
              willChange: "transform, opacity",
            }}
          >
            {/* Placeholder wordmark — swap for the real logo asset. */}
            <span
              style={{
                fontSize: "clamp(2.5rem, 11vw, 6rem)",
                fontWeight: 800,
                /* Large display type reads too loose at its natural tracking;
                   tighten as it grows (§15). */
                letterSpacing: "-0.04em",
                color: "#FDFCF9",
                lineHeight: 1,
              }}
            >
              FITVERSE
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: showLogo ? 1 : 0 }}
              transition={{ duration: 0.4, delay: showLogo ? 0.18 : 0 }}
              style={{
                fontSize: "clamp(12px, 1.5vmin, 15px)",
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              One system
            </motion.span>
          </motion.div>

          {/* Skip affordance. Appears once it is clear this is going to take a
              moment, and clears itself the instant the wordmark lands. */}
          {!reduced && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: showLogo ? 0 : 0.38 }}
              transition={{ duration: 0.5, delay: showLogo ? 0 : 1.3 }}
              style={{
                position: "absolute",
                bottom: "clamp(28px, 6vmin, 56px)",
                fontSize: "clamp(10.5px, 1.2vmin, 12.5px)",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#FDFCF9",
                pointerEvents: "none",
              }}
            >
              Tap to skip
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
