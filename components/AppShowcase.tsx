"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useInView,
  useReducedMotion,
  AnimatePresence,
  type MotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import { reveal, project, VelocityTracker } from "@/lib/motion";
import Button from "@/components/ui/Button";

/* ═══════════════════════════════════════════════════════════════════════════
   APP SHOWCASE — 3D curved carousel
   Five phone screens fanned on a curve, dragged around it.

   ── SWAPPING IN REAL SCREENSHOTS ────────────────────────────────────────────
   Edit SHOWCASE_SCREENS. Set `image` to a path in /public and the placeholder
   disappears. The array may hold MORE than five — only five are ever visible;
   the rest wait off the ends of the fan and rotate in as you drag. Dots,
   arrows, caption and autoplay all derive from the array length.

   ── THE FAN ─────────────────────────────────────────────────────────────────
   Geometry is taken from the supplied reference, measured off it rather than
   guessed. Height is the reliable scale cue — rotateY foreshortens width but
   never height — and gives 910 / 820 / 715 px across the three ranks:

     rank      rotateY    scale    translateZ    opacity
     centre       0°       1.00        0px         1.00
     ±1         ±38°       0.90      -110px        0.85
     ±2         ±56°       0.79      -215px        0.58

   Both progressions are SUB-LINEAR — 38° then 56°, not 38° then 76°; x steps
   0.86 then 1.40 card-widths, not 0.86 then 1.72. That is the signature of a
   curve rather than a flat row, and it is why a fixed-angular-step cylinder
   cannot reproduce this look. So instead of one angular step, every property
   is an interpolation CURVE over the card's offset from centre (see FAN).
   Integer offsets land exactly on the table above; the space between them is
   interpolated, which is what lets a drag move the whole fan continuously.

   Symmetry is structural, not duplicated: every output array is an odd or
   even function of the offset, so the right side cannot drift from the left.

   `rotateY = offset · A`. For the left card that is negative, which pushes its
   left edge back and brings its right edge forward — it turns to face centre.
   Mirrored on the right.

   Transform order works in our favour here, so placement needs no CSS string:
   Framer emits `translate3d() scale() rotateY()`, and translate-then-rotate is
   exactly "put it in place, then spin it about its own centre".

   ── WHY TWO LAYERS PER CARD ─────────────────────────────────────────────────
     1. fan       x / z / rotateY / scale / opacity, all derived from the
                  shared position value, so they update on the compositor and
                  never pass through React.
     2. presence  entrance stagger and hover lift, driven by variants.

   Nested opacities multiply, so the reveal and the fan fade compose instead of
   fighting over one property. React re-renders only when the active index
   changes — for the caption — never per frame.

   ── DRAG ────────────────────────────────────────────────────────────────────
   Pointer-down captures the pointer and STOPS any running settle, so a moving
   fan can be grabbed mid-flight and reversed (§3, interruptibility).
   Pointer-move writes the position 1:1 with the finger. On release the tracked
   velocity is projected with Apple's decay function, the projection is rounded
   to the nearest slot, and a spring carries the release velocity into it — so
   a short fast flick throws it and a long slow drag does not (§5, §6).
   ═══════════════════════════════════════════════════════════════════════════ */

export type ShowcaseScreen = {
  /** Path in /public, or null for the labelled placeholder. */
  image: string | null;
  label: string;
  /** Flat placeholder colour, ignored once `image` is set. */
  tint: string;
};

export const SHOWCASE_SCREENS: ShowcaseScreen[] = [
  { image: "/screen-dashboard.webp",         label: "Dashboard",         tint: "#1E1B4B" },
  { image: "/screen-exercise-detail.webp",   label: "Exercise Detail",   tint: "#064E3B" },
  { image: "/screen-active-logger.webp",     label: "Active Logger",     tint: "#2E1065" },
  { image: "/screen-session-summary.webp",   label: "Session Summary",   tint: "#5C1520" },
  { image: "/screen-diary.webp",             label: "Diary",             tint: "#0C4A6E" },
  { image: "/screen-scan.webp",              label: "Scan",              tint: "#4C1D95" },
  { image: "/screen-trends.webp",            label: "Trends",            tint: "#134E4A" },
  { image: "/screen-sleep.webp",             label: "Sleep",             tint: "#8C2F3D" },
  { image: "/screen-ai-coach.webp",          label: "AI Coach",          tint: "#831843" },
  { image: "/screen-wellness.webp",          label: "Wellness",          tint: "#1E3A8A" },
  { image: "/screen-meditation-player.webp", label: "Meditation Player", tint: "#3F6212" },
  { image: "/screen-community.webp",         label: "Community",         tint: "#7F1D1D" },
  { image: "/screen-leaderboard.webp",       label: "Leaderboard",       tint: "#0F766E" },
];

const CARD_W = "clamp(190px, 54vw, 262px)";
const GRID_CARD_W = "clamp(148px, 16vw, 208px)";

/* White, with only enough falloff at the edges to stop it reading as a flat
   slab and to give the outer phones something to sit against. The FAQ above
   is #F5F0E8, so the brighter centre still separates the two sections. */
const SECTION_BG =
  "radial-gradient(125% 88% at 50% 40%, #FFFFFF 0%, #FDFBF8 52%, #F6F1E9 100%)";
const SECTION_PAD = "clamp(88px, 12vh, 140px) 0";
const STAGE_MAX = 1680;
const STAGE_PAD = "clamp(16px, 3vw, 64px)";

/* Dark-on-white palette. #A83D0B on #FFFFFF is 6.3:1 and #57514B is 7.4:1 —
   both clear AA at these sizes. */
const INK = "#1A1512";
const INK_DIM = "#57514B";
const ACCENT = "#A83D0B";

const AUTOPLAY_MS = 3200;

/* Rank values from the reference. Index = |offset|. `x` is in card-widths so
   the fan rescales with the phone instead of needing a second breakpoint set.

   Ranks 0–2 are the five visible phones. Rank 3 is the EXIT rank: fully
   transparent, sitting a little further out and back. It is what keeps the fan
   at five regardless of how long the array grows — without it, a 13-screen
   array would interpolate opacity all the way from rank 2 to the wrap point at
   ±6.5 and leave nine phones on screen. Cards are gone by ±3 and stay gone. */
const FAN = {
  x:       [0, 0.86, 1.40, 1.72],
  z:       [0, -110, -215, -290],
  rotate:  [0, 38, 56, 64],
  scale:   [1, 0.90, 0.79, 0.70],
  opacity: [1, 0.85, 0.58, 0],
};

/* Phones crowd together on a narrow screen, so the fan tightens and the outer
   rank drops away rather than shrinking into an unreadable sliver. */
const TIER = {
  narrow: { xMul: 0.62, zMul: 0.7, perspective: 900,  outerOpacity: 0.0, lift: 0 },
  mid:    { xMul: 0.86, zMul: 0.9, perspective: 1200, outerOpacity: 0.42, lift: -8 },
  wide:   { xMul: 1.00, zMul: 1.0, perspective: 1500, outerOpacity: 0.58, lift: -10 },
};
type Tier = keyof typeof TIER;

/** Settle after a release. Critically damped — a fan that bounces past the
    card you threw it at reads as sloppy, not playful. */
const SETTLE = { type: "spring" as const, bounce: 0, duration: 0.72 };

/** Shortest signed distance in slot units, so the fan never takes the long way. */
function wrapSlots(d: number, n: number): number {
  const x = ((d % n) + n) % n;
  return x > n / 2 ? x - n : x;
}

/* Layered shadow rather than one hard drop. Per §12 a bigger surface reads as
   thicker, so the outer layer is deep and soft while two tighter layers keep
   the frame anchored. `depth` lightens all of it for receded ranks — something
   further back sits closer to its ground and casts less. A negative depth
   deepens it, which is what the hover lift uses. */
function frameShadow(depth: number) {
  const d = Math.min(depth, 2);
  return [
    `0 2px 6px rgba(15,13,10,${(0.10 - d * 0.03).toFixed(3)})`,
    `0 ${14 - d * 3}px ${32 - d * 6}px rgba(15,13,10,${(0.13 - d * 0.035).toFixed(3)})`,
    `0 ${44 - d * 10}px ${88 - d * 20}px rgba(15,13,10,${(0.20 - d * 0.055).toFixed(3)})`,
    `inset 0 1px 0 rgba(255,255,255,0.16)`,
  ].join(", ");
}

function PhoneFrame({
  screen,
  depth = 0,
  width = CARD_W,
}: {
  screen: ShowcaseScreen;
  depth?: number;
  width?: string;
}) {
  return (
    <div
      style={{
        width,
        aspectRatio: "9 / 19.5",
        borderRadius: "clamp(28px, 7vw, 38px)",
        padding: 9,
        background: "linear-gradient(160deg, #2A2521 0%, #0F0D0A 55%, #241F1B 100%)",
        boxShadow: frameShadow(depth),
        transition: "box-shadow 240ms ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "clamp(20px, 5.4vw, 30px)",
          overflow: "hidden",
          position: "relative",
          background: screen.image ? "#0F0D0A" : screen.tint,
        }}
      >
        {screen.image ? (
          <Image
            src={screen.image}
            alt={screen.label}
            fill
            sizes="(max-width: 768px) 54vw, 262px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          >
            <span style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
            }}>
              Placeholder
            </span>
            <span style={{
              fontSize: "clamp(15px, 4vw, 19px)", fontWeight: 700,
              letterSpacing: "-0.02em", color: "rgba(255,255,255,0.94)",
            }}>
              {screen.label}
            </span>
          </div>
        )}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", top: "1.9%", left: "50%", transform: "translateX(-50%)",
            width: "27%", height: "3.4%", minHeight: 14, borderRadius: 100, background: "#0F0D0A",
          }}
        />
      </div>
    </div>
  );
}

/* ── One card on the fan ──────────────────────────────────────────────────── */
function FanCard({
  screen,
  i,
  count,
  pos,
  cardW,
  tier,
  revealed,
  reachable,
  onSelect,
}: {
  screen: ShowcaseScreen;
  i: number;
  count: number;
  pos: MotionValue<number>;
  cardW: number;
  tier: Tier;
  revealed: boolean;
  reachable: boolean;
  onSelect: () => void;
}) {
  const t = TIER[tier];
  const [hovered, setHovered] = useState(false);

  /* This card's signed distance from centre, in slots. Everything below hangs
     off this one derived value. */
  const rel = useTransform(pos, (p) => wrapSlots(i - p, count));

  /* Cards are fully transparent by ±3 and stay that way out to the wrap point,
     so one crossing from one end of the fan to the other is already invisible
     when it jumps. `bound` is floored at 3.5 purely to keep these stops
     monotonic for short arrays; useTransform requires an increasing range. */
  const bound = Math.max(count / 2, 3.5);
  const stops = [-bound, -3, -2, -1, 0, 1, 2, 3, bound];
  /* Odd for x and rotateY (sign flips across centre), even for the rest. The
     right half is generated from the left, so they cannot drift apart. */
  const mirror = (a: number[], odd = false) => {
    const s = (v: number) => (odd ? -v : v);
    return [s(a[3]), s(a[3]), s(a[2]), s(a[1]), a[0], a[1], a[2], a[3], a[3]];
  };

  /* ── Baseline ────────────────────────────────────────────────────────────
     Cards scale about their own centres, so a receded card loses height off
     BOTH ends: at rank 2 its top sits ~100px below the centre card's top and
     its base ~100px above the centre card's base. Measured, the centres are
     pixel-identical — the geometry is exact — but with no common ground line
     the phones read as floating at different heights rather than standing
     level. Each rank is therefore pushed down by half the height it lost,
     which lands every phone's base on one line.

     The shrink factor is NOT the naive centre-depth projection p/(p−z). A
     card is also turned on rotateY, so its near edge projects taller than its
     far edge and the box takes the near edge — measured, a rank-1 card renders
     at 0.883 of full height where centre-depth predicts 0.839. sqrt(pf) tracks
     the measured heights to within a few px across all ranks; the residual
     base spread is 4px on a 568px card. Verified by measuring the live DOM,
     not derived — if the fan geometry changes, re-measure. */
  const cardH = cardW * (19.5 / 9);
  const yRanks = FAN.scale.map((s, r) => {
    const pf = t.perspective / (t.perspective - FAN.z[r] * t.zMul);
    return (cardH * (1 - s * Math.sqrt(pf))) / 2;
  });

  const x = useTransform(rel, stops, mirror(FAN.x, true).map((v) => v * cardW * t.xMul));
  const y = useTransform(rel, stops, mirror(yRanks));
  const z = useTransform(rel, stops, mirror(FAN.z).map((v) => v * t.zMul));
  const rotateY = useTransform(rel, stops, mirror(FAN.rotate, true));
  const scale = useTransform(rel, stops, mirror(FAN.scale));
  const opacity = useTransform(
    rel,
    stops,
    [0, 0, t.outerOpacity, FAN.opacity[1], 1, FAN.opacity[1], t.outerOpacity, 0, 0]
  );

  const canHover = tier !== "narrow" && reachable;

  return (
    /* 1. Fan — compositor-driven, never re-rendered. Absolute centring via
          `inset:0; margin:auto` keeps the transform origin on the card's own
          centre, which is what makes rotateY spin it in place. */
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        margin: "auto",
        width: "max-content",
        height: "max-content",
        x, y, z, rotateY, scale, opacity,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
        pointerEvents: reachable ? "auto" : "none",
      }}
    >
      {/* 2. Presence — entrance stagger and hover lift. */}
      <motion.div
        initial={{ opacity: 0, y: 44, scale: 0.9 }}
        animate={revealed ? { opacity: 1, y: 0, scale: 1 } : {}}
        /* Centre outward, 80ms apart. Clamped at rank 2 so the cards waiting
           off the ends of a long array do not queue up behind a long delay. */
        transition={{ ...reveal, delay: Math.min(Math.abs(wrapSlots(i, count)), 2) * 0.08 }}
        whileHover={canHover ? { y: t.lift, scale: 1.035 } : undefined}
        onHoverStart={() => canHover && setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onSelect}
        style={{ cursor: reachable ? "pointer" : "default" }}
      >
        <PhoneFrame screen={screen} depth={hovered ? -0.7 : 0} />
      </motion.div>
    </motion.div>
  );
}

export default function AppShowcase() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  /* IntersectionObserver, via Framer Motion's wrapper around it. */
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (inView) setRevealed(true); }, [inView]);

  const count = SHOWCASE_SCREENS.length;

  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false);
  const [tier, setTier] = useState<Tier>("wide");
  const [cardW, setCardW] = useState(262);

  /* The single source of truth: position along the fan, in slot units.
     Unbounded — wrapSlots folds it back onto the visible ranks. */
  const pos = useMotionValue(0);
  const settle = useRef<AnimationPlaybackControls | null>(null);
  const tracker = useRef(new VelocityTracker());
  const drag = useRef({ active: false, startX: 0, startPos: 0, moved: false });
  const sizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 640px)");
    const medium = window.matchMedia("(max-width: 1280px)");
    const sync = () => setTier(small.matches ? "narrow" : medium.matches ? "mid" : "wide");
    sync();
    small.addEventListener("change", sync);
    medium.addEventListener("change", sync);
    return () => {
      small.removeEventListener("change", sync);
      medium.removeEventListener("change", sync);
    };
  }, []);

  /* Spacing follows the real rendered card width rather than a duplicated copy
     of the clamp above, so changing CARD_W cannot silently desync the fan. */
  useEffect(() => {
    const el = sizerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      if (w > 0) setCardW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Caption follows the fan, but React only hears about whole slots. */
  useMotionValueEvent(pos, "change", (p) => {
    const next = ((Math.round(p) % count) + count) % count;
    setIndex((cur) => (cur === next ? cur : next));
  });

  const slideTo = useCallback((target: number, velocity = 0) => {
    settle.current?.stop();
    settle.current = animate(pos, target, { ...SETTLE, velocity });
  }, [pos]);

  /* Always travel the short way round. */
  const goToIndex = useCallback((i: number) => {
    setManual(true);
    const current = pos.get();
    slideTo(current + wrapSlots(i - current, count));
  }, [pos, count, slideTo]);

  const stepBy = useCallback((delta: number) => {
    setManual(true);
    slideTo(Math.round(pos.get()) + delta);
  }, [pos, slideTo]);

  /* ── Pointer drag ──────────────────────────────────────────────────────── */
  const slotsPerPx = () => 1 / (cardW * 1.05);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    /* Grab it mid-flight — never make someone wait for a settle to finish. */
    settle.current?.stop();
    drag.current = { active: true, startX: e.clientX, startPos: pos.get(), moved: false };
    tracker.current.reset();
    tracker.current.add(e.clientX);
    setManual(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    /* Dragging right walks the fan backwards, as a physical rack would. */
    pos.set(drag.current.startPos - dx * slotsPerPx());
    tracker.current.add(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const vPx = tracker.current.get();            // px/s
    const vSlots = -vPx * slotsPerPx();           // slots/s, matching drag sign
    /* Project where a free spin would coast to, then snap to the slot nearest
       THAT point rather than to wherever the finger happened to lift. Capped
       so a hard flick advances a card or two, not a blur. */
    const coast = Math.max(-1.6, Math.min(1.6, project(vSlots)));
    slideTo(Math.round(pos.get() + coast), vSlots);
  };

  /* Autoplay until the reader takes over, then never again — their intent
     outranks it. Also waits for the section to actually be on screen. */
  useEffect(() => {
    if (!inView || manual || reduced) return;
    const id = setInterval(() => slideTo(Math.round(pos.get()) + 1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [inView, manual, reduced, pos, slideTo]);

  useEffect(() => () => settle.current?.stop(), []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); stepBy(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); stepBy(1); }
  };

  const t = TIER[tier];
  const current = SHOWCASE_SCREENS[index];
  /* Only the five on the fan accept clicks — anything waiting off the ends is
     invisible and must not be hit-testable. */
  const reachable = (i: number) => Math.abs(wrapSlots(i - index, count)) <= 2;

  /* ── Reduced motion: a static grid, no 3D, no drag, nothing moves. ── */
  if (reduced) {
    return (
      <section
        style={{ background: SECTION_BG, padding: SECTION_PAD }}
        aria-labelledby="showcase-heading"
      >
        <div className="max-w-7xl mx-auto px-6">
          <Header />
          <ul className="mt-16 grid gap-10 list-none p-0 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 justify-items-center">
            {SHOWCASE_SCREENS.map((s) => (
              <li key={s.label} className="flex flex-col items-center gap-4">
                <PhoneFrame screen={s} width={GRID_CARD_W} />
                <p style={{ fontSize: 14, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden"
      style={{ background: SECTION_BG, padding: SECTION_PAD }}
      aria-labelledby="showcase-heading"
    >
      {/* Heading stays in the reading container — running text edge to edge is
          hard to scan and would not match the sections above. */}
      <div className="max-w-7xl mx-auto px-6">
        <Header />
      </div>

      {/* Everything below is full-bleed. The outer rank is meant to crop
          against the edges, as it does in the reference. */}
      <div
        className="w-full flex flex-col items-center"
        role="group"
        aria-roledescription="carousel"
        aria-label="FitVerse app screens"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          outlineOffset: 6,
          marginTop: "clamp(36px, 5vh, 64px)",
          maxWidth: STAGE_MAX,
          marginInline: "auto",
          paddingInline: STAGE_PAD,
        }}
      >
        {/* Invisible ruler: the real clamp, measured, so spacing cannot desync. */}
        <div ref={sizerRef} aria-hidden="true"
             style={{ position: "absolute", width: CARD_W, height: 0, visibility: "hidden", pointerEvents: "none" }} />

        {/* Stage */}
        <div
          className="relative w-full"
          style={{
            height: "min(76svh, 660px)",
            perspective: t.perspective,
            perspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            touchAction: "pan-y",
            cursor: "grab",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {SHOWCASE_SCREENS.map((s, i) => (
            <FanCard
              key={s.label}
              screen={s}
              i={i}
              count={count}
              pos={pos}
              cardW={cardW}
              tier={tier}
              revealed={revealed}
              reachable={reachable(i)}
              onSelect={() => { if (!drag.current.moved) goToIndex(i); }}
            />
          ))}
        </div>

        {/* Caption — restaggers whenever the active card changes. */}
        <div style={{ height: 30, marginTop: "clamp(20px, 3vh, 34px)" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", bounce: 0, duration: 0.34 }}
              style={{
                fontSize: 17, fontWeight: 600, color: INK,
                letterSpacing: "-0.015em", textAlign: "center",
              }}
            >
              {current.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4" style={{ marginTop: "clamp(18px, 3vh, 30px)" }}>
          <Button
            onClick={() => stepBy(-1)}
            aria-label="Previous screen"
            variant="icon"
            size="lg"
            style={{ color: INK }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choose screen">
            {SHOWCASE_SCREENS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.label}
                onClick={() => goToIndex(i)}
                className="rounded-full"
                style={{ height: 8, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
              >
                <motion.span
                  className="block rounded-full"
                  animate={{
                    width: i === index ? 26 : 8,
                    backgroundColor: i === index ? ACCENT : "#CFC5B7",
                  }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  style={{ height: 8 }}
                />
              </button>
            ))}
          </div>

          <Button
            onClick={() => stepBy(1)}
            aria-label="Next screen"
            variant="icon"
            size="lg"
            style={{ color: INK }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>

        <p role="status" aria-live="polite" style={{ fontSize: 13.5, color: INK_DIM, marginTop: 14 }}>
          {current.label} — {index + 1} of {count}
        </p>
      </div>
    </section>
  );
}

function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reveal}
      className="text-center"
    >
      <p style={{
        fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", color: ACCENT, marginBottom: 16,
      }}>
        Inside the app
      </p>
      <h2 id="showcase-heading" style={{
        fontSize: "clamp(1.875rem, 4vw, 2.75rem)", fontWeight: 700, color: INK,
        letterSpacing: "-0.03em", lineHeight: 1.08, textWrap: "balance",
      }}>
        See FitVerse in Action
      </h2>
    </motion.div>
  );
}
