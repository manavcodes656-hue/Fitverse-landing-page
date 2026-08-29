"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
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
   Eight drifting modules gather, collapse into one, and resolve as FitVerse.
   Whole sequence, first frame to homepage revealed: 5.00s.

   ── THE VISUAL LANGUAGE ─────────────────────────────────────────────────────
   Each module is a dark-glass tile — near-black with a faint wash of its
   hue — carrying a custom thin-stroke glyph glowing inside. The tiles sit
   SETTLED at their stations (±3px of slow breath, nothing loose), then on
   the merge they close like an iris: glide onto a perfect ring, turn 40° as
   one body while the ring contracts, and resolve into the FitVerse mark.

   Hues are the same per-module accents the Features section uses, so the
   intro and the features read as one system.

   `x`/`y` are the resting offsets in units of the responsive spread radius,
   so the scatter stays proportional on every screen size.
   ═══════════════════════════════════════════════════════════════════════════ */

export type IntroIcon = {
  id: string;
  label: string;
  /** The module's light. Tile tint, stroke and glow all derive from it. */
  hue: string;
  /** Resting offset from centre, in multiples of the spread radius (-1…1). */
  x: number;
  y: number;
  /** Drift speed multiplier — small variations stop them moving as one body. */
  drift: number;
  /** Assigned slot on the convergence ring, in degrees (screen coords,
      -90 = top). Each icon takes the slot nearest its resting angle, so the
      glide onto the ring never crosses another icon's path. */
  ring: number;
};

export const INTRO_ICONS: IntroIcon[] = [
  { id: "ai-coach",  label: "AI Coaching",    hue: "#D9702F", x:  0.06, y: -0.94, drift: 0.78, ring:  -90 },
  { id: "nutrition", label: "Nutrition",      hue: "#8FBF6F", x:  0.80, y: -0.58, drift: 1.24, ring:  -45 },
  { id: "workouts",  label: "Workouts",       hue: "#E25C4F", x: -0.84, y: -0.52, drift: 1.00, ring: -135 },
  { id: "sleep",     label: "Sleep",          hue: "#8B9FE8", x:  1.02, y:  0.24, drift: 0.86, ring:    0 },
  { id: "recovery",  label: "Recovery",       hue: "#B18BE8", x: -1.06, y:  0.20, drift: 1.32, ring:  180 },
  { id: "wellness",  label: "Wellness",       hue: "#5FB5A5", x:  0.48, y:  0.82, drift: 1.12, ring:   45 },
  { id: "community", label: "Community",      hue: "#E5B54E", x: -0.56, y:  0.78, drift: 0.94, ring:  135 },
  { id: "cycle",     label: "Cycle Tracking", hue: "#E08BB0", x: -0.02, y:  1.02, drift: 1.08, ring:   90 },
];

/* ── The glyphs ─────────────────────────────────────────────────────────────
   One drawing per module, all on a 48×48 grid, stroke-only. Deliberately
   abstract-minimal rather than literal iconography: each is a single idea —
   a crescent, a settling wave, a breathing ring — legible at a glance with
   the label underneath doing the naming. */
export const GLYPH_PATHS: Record<string, string[]> = {
  /* Broken focus arcs around a core: attention, reading everything. */
  "ai-coach": [
    "M24 8 A16 16 0 0 1 40 24",
    "M24 40 A16 16 0 0 1 8 24",
    "M28 24a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  ],
  /* A stem and its leaf. */
  nutrition: [
    "M24 41 C24 31 24 22 30 12",
    "M30 12 C22 12 16 18 16.5 26 C25 25.5 30 19 30 12 Z",
  ],
  /* A rising pulse. */
  workouts: ["M7 34 H14 L19 26 L25 31 L31 14 L34 22 H41"],
  /* A crescent. */
  sleep: ["M30 8 A17 17 0 1 0 30 40 A13.5 13.5 0 0 1 30 8 Z"],
  /* A wave settling flat. */
  recovery: [
    "M7 24 C10 15 13.5 15 16.5 24 C19 31 21.5 31 24 24 C26 18.5 28 18.5 30 24 C31.7 28 33.6 28 35.3 24 L41 24",
  ],
  /* A breathing ring: the outer breath, the inner rest. */
  wellness: [
    "M39 24a15 15 0 1 1-30 0 15 15 0 0 1 30 0",
    "M31 24a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  ],
  /* Three lives overlapping. */
  community: [
    "M32 17a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    "M25.5 30a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    "M38.5 30a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  ],
  /* An open loop with its phase marked. */
  cycle: [
    "M24 9 A15 15 0 1 1 11.2 16.2",
    "M13 20.5a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0",
  ],
};

/* ── Scale ──────────────────────────────────────────────────────────────────
   Everything sizes off the viewport's smaller edge (vmin), so the composition
   holds its proportions from a 360px phone to a 27" display instead of
   becoming a cluster of small objects marooned in a large empty screen.     */
const TILE = "clamp(56px, 8vmin, 82px)";
const RADIUS_MIN = 130;
const RADIUS_MAX = 300;

/* Presence, not drift: ±3px of slow breath at low frequency. The modules
   read as settled objects with life in them, not things floating loose. */
const DRIFT_AX = 3;
const DRIFT_AY = 3.5;

/* ── The tile ───────────────────────────────────────────────────────────────
   The container, back by request — executed as dark glass rather than the
   old flat tinted square: near-black fill with a faint wash of the module's
   hue, a 1px hue-tinted border, a top light-catch, and the stroke glyph
   glowing quietly inside. Shared with the features page's gathering beat so
   both experiences carry one visual language. */
export function GlyphTile({ id, hue, size = TILE }: { id: string; hue: string; size?: string }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "24%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(155deg, ${hue}1C 0%, rgba(16,13,11,0.94) 58%, rgba(10,9,7,0.96) 100%)`,
        border: `1px solid ${hue}3D`,
        boxShadow: `0 16px 44px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.09), 0 0 30px ${hue}14`,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        style={{ width: "58%", height: "58%", overflow: "visible", filter: `drop-shadow(0 0 5px ${hue}70)` }}
      >
        {(GLYPH_PATHS[id] ?? []).map((d, i) => (
          <path key={i} d={d} stroke={hue} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </span>
  );
}

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
  const amp = stage === "float" ? 1 : 0;

  const driftX = useTransform(clock, (t) => Math.sin(t * 0.7 * item.drift + seed) * DRIFT_AX * amp);
  const driftY = useTransform(clock, (t) => Math.cos(t * 0.55 * item.drift + seed * 1.3) * DRIFT_AY * amp);

  /* Ring-then-collapse. Beat one: every tile glides onto a perfect circle —
     equal spacing, equal radius — so for a moment there is a precise,
     engineered ring. Beat two: the ring turns 40° as ONE body while it
     contracts into the centre, accelerating as it closes (radius ∝ 1−g^1.6,
     baked into the keyframes; the tween runs linear). An iris closing, not
     a vortex. The 30ms stagger is grain, not a cascade — all eight are in
     formation and arrive together. */
  const merge = useMemo(() => {
    const ringR = radius * 0.62;
    const th0 = (item.ring * Math.PI) / 180;
    const sweep = (40 * Math.PI) / 180;
    const N = 9;
    const xs: (number | null)[] = [null];
    const ys: (number | null)[] = [null];
    const times = [0];
    xs.push(Math.cos(th0) * ringR);
    ys.push(Math.sin(th0) * ringR);
    times.push(0.38);
    for (let k = 1; k <= N; k++) {
      const g = k / N;
      const th = th0 + sweep * g;
      const r = ringR * (1 - Math.pow(g, 1.6));
      xs.push(Math.cos(th) * r);
      ys.push(Math.sin(th) * r);
      times.push(0.38 + 0.62 * g);
    }
    /* Segment easings: an easeInOut glide onto the ring, then linear along
       the pre-baked arc. */
    const ease = ["easeInOut", ...Array<string>(N).fill("linear")] as ("easeInOut" | "linear")[];
    return { xs, ys, times, ease };
  }, [item.ring, radius]);

  const target =
    stage === "merge"
      ? {
          x: merge.xs,
          y: merge.ys,
          opacity: [null, 1, 1, 0] as (number | null)[],
          scale: [null, 0.9, 0.8, 0.1] as (number | null)[],
        }
      : stage === "gather"
        ? { x: item.x * radius * 1.12, y: item.y * radius * 1.12, opacity: 1, scale: 0.96 }
        : { x: item.x * radius, y: item.y * radius, opacity: 1, scale: 1 };

  const transition =
    stage === "merge"
      ? {
          x: { duration: 1.02, delay: index * 0.03, times: merge.times, ease: merge.ease },
          y: { duration: 1.02, delay: index * 0.03, times: merge.times, ease: merge.ease },
          scale: { duration: 1.02, delay: index * 0.03, times: [0, 0.38, 0.62, 1], ease: "easeIn" as const },
          /* Gone just before the centre — you see the close, never the pile-up. */
          opacity: { duration: 1.02, delay: index * 0.03, times: [0, 0.38, 0.78, 0.97] },
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(9px, 1.4vmin, 14px)",
        }}
      >
        <GlyphTile id={item.id} hue={item.hue} />
        {/* Labels step aside the moment the ring forms — eight captions
            rotating in formation would be noise, not information. */}
        <motion.span
          animate={{ opacity: stage === "merge" ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          style={{
            fontSize: "clamp(11px, 1.5vmin, 14px)",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.66)",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </motion.span>
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
