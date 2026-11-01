"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
import { reveal, project, VelocityTracker, useInViewSafe } from "@/lib/motion";
import Button from "@/components/ui/Button";
import PhoneFrame from "@/components/ui/PhoneFrame";
import { ACCENT, INK, INK_DIM } from "@/lib/tokens";

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
  { image: "/screen-cycle.webp",             label: "Cycle",             tint: "#9D174D" },
  { image: "/screen-meditation-player.webp", label: "Meditation Player", tint: "#3F6212" },
  { image: "/screen-community.webp",         label: "Community",         tint: "#7F1D1D" },
  { image: "/screen-leaderboard.webp",       label: "Leaderboard",       tint: "#0F766E" },
];

const CARD_W = "clamp(190px, 54vw, 262px)";
const GRID_CARD_W = "clamp(148px, 16vw, 208px)";

/* White, with only enough falloff at the edges to stop it reading as a flat
   slab and to give the outer phones something to sit against. The edge ends
   on --page-bg, the colour of the FAQ below it, so the two join without a seam. */
const SECTION_BG = "var(--page-bg)";
const SECTION_PAD = "clamp(88px, 12vh, 140px) 0";
const STAGE_MAX = 1680;
const STAGE_PAD = "clamp(16px, 3vw, 64px)";

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
  mid:    { xMul: 0.86, zMul: 0.9, perspective: 1200, outerOpacity: 0.42, lift: 0 },
  wide:   { xMul: 1.00, zMul: 1.0, perspective: 1500, outerOpacity: 0.58, lift: 0 },
};
type Tier = keyof typeof TIER;
type Fan = typeof FAN;
type TierCfg = (typeof TIER)[Tier];
type Layout = "desktop" | "tablet" | "phone";

/* Phones (under 768px): no separate geometry. The fan below is the desktop fan
   (FAN + TIER.wide, 262px centre phone) laid out at its natural size, then the
   whole stage is scaled down uniformly by --fan-scale (globals.css). Same arc, angles, fade
   and overlaps, just smaller. */
const FAN_CARD_PX = 262;
/* Enlarged centre phone height — what the stage reserves. */
const STAGE_H = FAN_CARD_PX * (19.5 / 9) * 1.035;
/* Phone-only depth fade; position, shape and shadows still come from FAN. */
const PHONE_FAN_OPACITY: Fan = { ...FAN, opacity: [1, 0.75, 0.5, 0] };
const PHONE_FILTER = ["saturate(1) brightness(1)", "saturate(0.7) brightness(0.92)", "saturate(0.5) brightness(0.85)", "saturate(0.5) brightness(0.85)"];

/** Settle after a release. Critically damped — a fan that bounces past the
    card you threw it at reads as sloppy, not playful. */
const SETTLE = { type: "spring" as const, bounce: 0, duration: 0.72 };

/** Shortest signed distance in slot units, so the fan never takes the long way. */
function wrapSlots(d: number, n: number): number {
  const x = ((d % n) + n) % n;
  return x > n / 2 ? x - n : x;
}

/* ── One card on the fan ──────────────────────────────────────────────────── */
function FanCard({
  screen,
  i,
  count,
  pos,
  cardW,
  fan,
  t,
  hoverable,
  fade,
  cardWCss,
  revealed,
  reachable,
  onSelect,
}: {
  screen: ShowcaseScreen;
  i: number;
  count: number;
  pos: MotionValue<number>;
  cardW: number;
  fan: Fan;
  t: TierCfg;
  hoverable: boolean;
  /** Phones: dim and desaturate the receded ranks. */
  fade: boolean;
  cardWCss: string;
  revealed: boolean;
  reachable: boolean;
  onSelect: () => void;
}) {
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
  const yRanks = fan.scale.map((s, r) => {
    const pf = t.perspective / (t.perspective - fan.z[r] * t.zMul);
    return (cardH * (1 - s * Math.sqrt(pf))) / 2;
  });

  const x = useTransform(rel, stops, mirror(fan.x, true).map((v) => v * cardW * t.xMul));
  const y = useTransform(rel, stops, mirror(yRanks));
  const z = useTransform(rel, stops, mirror(fan.z).map((v) => v * t.zMul));
  const rotateY = useTransform(rel, stops, mirror(fan.rotate, true));
  const scale = useTransform(rel, stops, mirror(fan.scale));
  const opacity = useTransform(
    rel,
    stops,
    [0, 0, t.outerOpacity, fan.opacity[1], 1, fan.opacity[1], t.outerOpacity, 0, 0]
  );

  const filter = useTransform(rel, stops, [
    PHONE_FILTER[3], PHONE_FILTER[3], PHONE_FILTER[2], PHONE_FILTER[1], PHONE_FILTER[0],
    PHONE_FILTER[1], PHONE_FILTER[2], PHONE_FILTER[3], PHONE_FILTER[3],
  ]);

  const canHover = hoverable && reachable;

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
        ...(fade ? { filter } : {}),
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
        style={{ cursor: reachable ? "pointer" : "default", transformOrigin: "50% 50%" }}
      >
        <PhoneFrame screen={screen} depth={hovered ? -0.7 : 0} width={cardWCss} />
      </motion.div>
    </motion.div>
  );
}

/* Which fan geometry applies. Re-evaluated only when a breakpoint is crossed. */
function useFanLayout() {
  const [tier, setTier] = useState<Tier>("wide");
  const [layout, setLayout] = useState<Layout>("desktop");
  const [vw, setVw] = useState(390);
  useEffect(() => {
    const small = window.matchMedia("(max-width: 640px)");
    const medium = window.matchMedia("(max-width: 1280px)");
    const phoneMq = window.matchMedia("(max-width: 767px)");
    const tabletMq = window.matchMedia("(max-width: 1023px)");
    const all = [small, medium, phoneMq, tabletMq];
    const sync = () => {
      setTier(small.matches ? "narrow" : medium.matches ? "mid" : "wide");
      setVw(document.documentElement.clientWidth);
      setLayout(phoneMq.matches ? "phone" : tabletMq.matches ? "tablet" : "desktop");
    };
    sync();
    all.forEach((mq) => mq.addEventListener("change", sync));
    window.addEventListener("resize", sync);
    return () => all.forEach((mq) => mq.removeEventListener("change", sync));
      window.removeEventListener("resize", sync);
  }, []);
  return { tier, layout, vw };
}

export default function AppShowcase() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  /* IntersectionObserver, via Framer Motion's wrapper around it. */
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (inView) setRevealed(true); }, [inView]);
  /* Backstop: if the observer never reports, show the phones after 7s. */
  useEffect(() => { const id = setTimeout(() => setRevealed(true), 7000); return () => clearTimeout(id); }, []);

  const count = SHOWCASE_SCREENS.length;

  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false);
  const { tier, layout } = useFanLayout();
  const [cardW, setCardW] = useState(262);

  /* The single source of truth: position along the fan, in slot units.
     Unbounded — wrapSlots folds it back onto the visible ranks. */
  const pos = useMotionValue(0);
  const settle = useRef<AnimationPlaybackControls | null>(null);
  const tracker = useRef(new VelocityTracker());
  const drag = useRef({ active: false, startX: 0, startPos: 0, moved: false });
  const sizerRef = useRef<HTMLDivElement>(null);

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
    /* Phones: 450ms slot move; opacity, filter and position share it. */
    settle.current = animate(pos, target, { ...SETTLE, ...(layout === "phone" ? { duration: 0.45 } : {}), velocity });
  }, [pos, layout]);

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
  /* The fan scale lives in CSS (--fan-scale); swipe distance needs the same number. */
  const fanScale = () =>
    layout === "phone" && sizerRef.current
      ? parseFloat(getComputedStyle(sizerRef.current).getPropertyValue("--fan-scale")) || 1
      : 1;
  const slotsPerPx = () => 1 / (cardW * fanScale() * 1.05);

  const onPointerDown = (e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
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
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* not captured */ }

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

  const phone = layout === "phone";
  const t: TierCfg = phone ? { ...TIER.wide, outerOpacity: 0.5 } : layout === "tablet" ? { ...TIER[tier], outerOpacity: 0 } : TIER[tier];
  const fan: Fan = phone ? PHONE_FAN_OPACITY : FAN;
  const cardWCss = phone ? `${FAN_CARD_PX}px` : CARD_W;
  const current = SHOWCASE_SCREENS[index];
  /* Only the five on the fan accept clicks — anything waiting off the ends is
     invisible and must not be hit-testable. */
  const reachable = (i: number) => Math.abs(wrapSlots(i - index, count)) <= (layout === "tablet" ? 1 : 2);

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
                <p style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>
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
      className="overflow-hidden show-section"
      style={{ background: SECTION_BG, padding: phone ? "32px 0 32px" : "48px 0 40px" }}
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
        className="w-full flex flex-col items-center mt-5 show-group"
        role="group"
        aria-roledescription="carousel"
        aria-label="FitVerse app screens"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          outlineOffset: 6,
          /* In flow under the heading: 20px from the mt-5 class,
             no pull-up, and stacked below the heading. */
          position: "relative",
          zIndex: 1,
          maxWidth: STAGE_MAX,
          marginInline: "auto",
          paddingInline: STAGE_PAD,
        }}
      >
        {/* Invisible ruler: the real clamp, measured, so spacing cannot desync. */}
        <div ref={sizerRef} aria-hidden="true"
             style={{ position: "absolute", width: cardWCss, height: 0, visibility: "hidden", pointerEvents: "none" }} />

        {/* Phones: the stage is laid out at desktop size inside a box that is
            scaled down; the wrapper reserves the scaled height (scale() does not
            change layout size) so the heading and caption keep desktop gaps. */}
        <div
          style={phone ? { position: "relative", width: "100%", height: `calc(${STAGE_H}px * var(--fan-scale))` } : undefined}
        >
        <div
          style={phone ? {
            position: "absolute", top: 0, left: "50%", width: "calc(100% / var(--fan-scale))",
            transform: "translateX(-50%) scale(var(--fan-scale))", transformOrigin: "50% 0",
          } : undefined}
        >
        <div
          className="relative w-full"
          style={{
            /* Sized to the ENLARGED centre phone (rest height x 1.035) exactly, so the hover scale fills spare room instead of spilling. Rest: 262px wide, 568px tall; enlarged and min-height 588px. */
            minHeight: phone ? STAGE_H : `calc(clamp(190px, 54vw, 262px) * 19.5 / 9 * 1.035)`,
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
              fan={fan}
              t={t}
              hoverable={!phone}
              fade={phone}
              cardWCss={cardWCss}
              revealed={revealed}
              reachable={reachable(i)}
              onSelect={() => { if (!drag.current.moved) goToIndex(i); }}
            />
          ))}
        </div>
        </div>
        </div>

        {/* Caption — restaggers whenever the active card changes. */}
        <div className="show-caption" style={{ height: 26, marginTop: 16, position: "relative", zIndex: 2 }}>
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

        <ShowcaseControls index={index} onStep={stepBy} onGo={goToIndex} />
      </div>
    </section>
  );
}

/* Arrows either side of the dot row, then the "X of N" status line. */
function ShowcaseControls({ index, onStep, onGo }: { index: number; onStep: (delta: number) => void; onGo: (i: number) => void }) {
  const current = SHOWCASE_SCREENS[index];
  return (
    <>
    {/* Controls */}
    <div className="show-controls flex items-center gap-4 mt-3" style={{ position: "relative", zIndex: 2 }}>
      <Button
        onClick={() => onStep(-1)}
        aria-label="Previous screen"
        className="show-arrow"
        variant="icon"
        size="lg"
        style={{ color: INK }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>

      <div className="show-dots flex items-center gap-2" role="tablist" aria-label="Choose screen">
        {SHOWCASE_SCREENS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.label}
            onClick={() => onGo(i)}
            className="show-dot rounded-full"
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
        onClick={() => onStep(1)}
        aria-label="Next screen"
        className="show-arrow"
        variant="icon"
        size="lg"
        style={{ color: INK }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>

    <p role="status" aria-live="polite" className="show-count mt-[14px]" style={{ fontSize: 13.5, color: INK_DIM }}>
      {current.label} — {index + 1} of {SHOWCASE_SCREENS.length}
    </p>
    </>
  );
}

function Header() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInViewSafe(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={seen ? { opacity: 1, y: 0 } : {}}
      transition={reveal}
      className="text-center"
      style={{ position: "relative", zIndex: 2 }}
    >
      <p className="t-eyebrow" style={{ color: ACCENT, marginBottom: 16 }}>
        Inside the app
      </p>
      <h2 id="showcase-heading" className="t-section-title" style={{
        color: INK, textWrap: "balance",
      }}>
        See FitVerse in Action
      </h2>
    </motion.div>
  );
}
