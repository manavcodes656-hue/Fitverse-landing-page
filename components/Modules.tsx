"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { ACCENT, INK, INK_DIM } from "@/lib/tokens";

const panels: {
  number: string;
  name: string;
  subtitle: string;
  description: string;
  image: string | null;
  imageAlt: string;
  imageRight: boolean;
  bg: string;
  priority: boolean;
}[] = [
  {
    number: "01",
    name: "AI Coach",
    subtitle: "Your coach, always on.",
    description:
      "Structured by your health analysis, a personalized trainer — always there for you to make your well-being better.",
    image: "/module-ai-coach.png",
    imageAlt: "Training at home with the FitVerse AI Coach open on a phone",
    imageRight: true,
    bg: "var(--page-bg)",
    priority: true,
  },
  {
    number: "02",
    name: "Nutrition Tracker",
    subtitle: "Every meal, in context.",
    description:
      "A structured nutrition system for tracking intake, understanding balance, and staying aligned with your goals.",
    image: "/module-nutrition.png",
    imageAlt: "Logging a meal in FitVerse while preparing fresh food",
    imageRight: false,
    bg: "#F5F0E8",
    priority: false,
  },
  {
    number: "03",
    name: "Workout",
    subtitle: "Show up. Log it. Repeat.",
    description:
      "Library made for your everyday sessions. Turn your busy workouts and measure your progress.",
    image: "/module-workout.png",
    imageAlt: "Lifting in the gym with a FitVerse workout logged on a phone",
    imageRight: true,
    bg: "#FDFCF9",
    priority: false,
  },
  {
    number: "04",
    name: "Sleep Tracker",
    subtitle: "Recovery is training too.",
    description:
      "Translates sleep data into measurable insights for improved rest and recovery.",
    image: "/module-sleep.png",
    imageAlt: "Sleeping with FitVerse tracking the night from the bedside",
    imageRight: false,
    bg: "#F5F0E8",
    priority: false,
  },
  {
    number: "05",
    name: "Wellness and Community",
    subtitle: "Stronger together, tuned to you.",
    /* Placeholder copy — final wording to come. Both halves are deliberately
       present: the community side and cycle tracking as a named feature. */
    description:
      "Train alongside people chasing the same goals, and meditate for a calmer way to stay connected with your well-being.",
    image: "/module-wellness-community.png",
    imageAlt: "A guided FitVerse session running on a phone beside a yoga mat",
    imageRight: true,
    bg: "#FDFCF9",
    priority: false,
  },
];

const total = panels.length;

export default function Modules() {
  return (
    <>
      <ModulesPinned />
      <ModulesCarousel />
    </>
  );
}

/* ── Under 1024px: a swipe carousel. ─────────────────────────────────────────
   The pinned horizontal scroll needs a tall sticky frame, which is the wrong
   shape on a phone. This is a native scroll-snap row instead: the browser owns
   the gesture, so a vertical swipe keeps scrolling the page and a horizontal
   one only commits once it clears the snap threshold. */
function ModulesCarousel() {
  const reduced = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    const texts = Array.from(rail.querySelectorAll<HTMLElement>("[data-mtext]"));
    /* Mid-swipe two panels sit side by side. Each panel's text fades out as it
       leaves the centre, so two panels' text is never readable at once and can
       never collide at the seam. */
    const fade = () => {
      const pos = rail.scrollLeft / Math.max(1, rail.clientWidth);
      texts.forEach((el, i) => { el.style.opacity = String(Math.max(0, 1 - Math.abs(pos - i) * 2)); });
    };
    const onScroll = () => {
      fade();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth));
        setActive(Math.min(total - 1, Math.max(0, i)));
      });
    };
    fade();
    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", fade);
    return () => { rail.removeEventListener("scroll", onScroll); window.removeEventListener("resize", fade); cancelAnimationFrame(raf); };
  }, []);

  const goTo = (i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const n = Math.min(total - 1, Math.max(0, i));
    rail.scrollTo({ left: n * rail.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      className="lg:hidden fvm-section"
      aria-labelledby="modules-heading-m"
      style={{ background: "var(--page-bg)", padding: "calc(60px + 32px) 0 48px" }}
    >
      <h2 id="modules-heading-m" className="sr-only">The FitVerse modules</h2>
      <div
        ref={railRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="FitVerse modules"
        className="fv-noscroll flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory", overscrollBehaviorX: "contain", touchAction: "pan-x pan-y" }}
      >
        {panels.map((panel, i) => (
          <article
            key={panel.number}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            className="fv-gutter flex-shrink-0 w-full"
            style={{ scrollSnapAlign: "center", scrollSnapStop: "always", minWidth: 0, flex: "0 0 100%", overflow: "hidden" }}
          >
            <div className="mx-auto w-full" style={{ maxWidth: 520 }}>
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: "4/5", borderRadius: 20, background: "#E8E3DC", boxShadow: "0 20px 50px rgba(26,21,18,0.13), 0 3px 10px rgba(26,21,18,0.07)" }}
              >
                {panel.image && (
                  <Image src={panel.image} alt={panel.imageAlt} fill sizes="(max-width: 568px) 90vw, 520px" style={{ objectFit: "cover", objectPosition: "center" }} />
                )}
              </div>
              <div data-mtext style={{ marginTop: 24, textAlign: "left", minWidth: 0 }}>
                <span className="block leading-none select-none" style={{ fontFamily: "var(--font-head)", fontSize: 36, color: ACCENT, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 12 }}>
                  {panel.number}
                </span>
                <h3 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(26px, 7vw, 32px)", fontWeight: 600, color: INK, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 12 }}>
                  {panel.name}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 500, color: INK, lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: 12 }}>
                  {panel.subtitle}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: INK_DIM, lineHeight: 1.55, maxWidth: "42ch" }}>
                  {panel.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="fvm-controls">
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous module"
          className="fvm-arrow" style={{ opacity: active === 0 ? 0.4 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="fvm-dots" role="tablist" aria-label="Module navigation">
          {panels.map((panel, i) => (
            <button key={panel.number} type="button" role="tab" aria-selected={active === i} aria-label={panel.name} onClick={() => goTo(i)} className="fvm-dot">
              <span />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === total - 1} aria-label="Next module"
          className="fvm-arrow" style={{ opacity: active === total - 1 ? 0.4 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </section>
  );
}

function ModulesPinned() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  /* Scroll progress through the pinned region, 0 -> 1. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* A critically damped spring instead of a hand-tuned lerp constant. The
     spring carries velocity, so a fast scroll arrives fast and a slow one
     arrives gently — and it settles rather than easing on a fixed curve.
     Under reduced motion the rail tracks scroll exactly, with no smoothing
     lag that could read as drift. */
  const smoothed = useSpring(scrollYProgress, {
    bounce: 0,
    duration: reduced ? 0 : 0.4,
  });

  const x = useTransform(smoothed, [0, 1], ["0%", `-${((total - 1) / total) * 100}%`]);

  /* Only re-render React when the panel index actually changes — not on
     every animation frame, which is what the previous rAF loop did. */
  useMotionValueEvent(smoothed, "change", (v) => {
    const next = Math.min(total - 1, Math.max(0, Math.round(v * (total - 1))));
    setActive((prev) => (prev === next ? prev : next));
  });

  /* Progress dots are real controls: they move the page to that panel. */
  const goToPanel = useCallback((i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const start = el.offsetTop;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: start + (i / (total - 1)) * travel,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [reduced]);

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="relative hidden lg:block"
      style={{ height: `${(total + 1) * 100}vh` }}
      aria-labelledby="modules-heading"
    >
      <h2 id="modules-heading" className="sr-only">
        The FitVerse modules
      </h2>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div
          className="flex h-full"
          style={{ width: `${total * 100}vw`, x, willChange: "transform" }}
        >
          {panels.map((panel, i) => {
            const isActive = active === i;
            return (
              <div
                key={panel.number}
                className="flex-shrink-0 h-full flex items-center"
                style={{ width: "100vw", backgroundColor: panel.bg }}
                aria-hidden={!isActive}
              >
                <div className="w-full max-w-7xl mx-auto px-8 lg:px-16">
                  <article
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center ${
                      !panel.imageRight
                        ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
                        : ""
                    }`}
                  >
                    {/* Text */}
                    <motion.div
                      className="flex flex-col justify-center"
                      animate={
                        isActive
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: reduced ? 0 : 20 }
                      }
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    >
                      <span
                        className="font-extrabold leading-none mb-4 select-none"
                        style={{
                          fontFamily: "var(--font-head)",
                          fontSize: 44,
                          color: ACCENT,
                          fontWeight: 600,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {panel.number}
                      </span>
                      <h3
                        style={{
                          fontFamily: "var(--font-head)",
                          fontSize: 30,
                          fontWeight: 600,
                          color: INK,
                          lineHeight: 1.08,
                          letterSpacing: "-0.02em",
                          marginBottom: "12px",
                        }}
                      >
                        {panel.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 16,
                          fontWeight: 500,
                          color: INK,
                          lineHeight: 1.35,
                          letterSpacing: "-0.01em",
                          marginBottom: "16px",
                        }}
                      >
                        {panel.subtitle}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                          fontSize: 15.5,
                          color: INK_DIM,
                          lineHeight: 1.55,
                          maxWidth: "42ch",
                        }}
                      >
                        {panel.description}
                      </p>
                    </motion.div>

                    {/* Image — a mounted plate rather than a bare bleed. The
                        artwork sits inset on a tinted mat with its own inner
                        shadow, so it reads as a framed object on the panel
                        instead of a rectangle cropped out of it.

                        The frame is 5:4. The photos are 3:2 (1.50), one 1.83
                        and one 1.12, so `cover` is right — `contain` would
                        letterbox inside a frame that is meant to be filled.
                        Cover trims 8% per side on the 3:2 shots; the 1.83
                        AI Coach frame loses more, so it is nudged off centre
                        to keep the phone and the person in view. */}
                    {/* Width is height-capped on mobile: this plate stacks
                        under the text inside a 100svh pinned frame, so a
                        width-derived size is exactly what clips on a short
                        phone. 50svh wide at 5:4 is 40svh tall, which leaves
                        room for the text above it. */}
                    <motion.div
                      className="relative w-[min(100%,50svh)] mx-auto lg:w-full lg:mx-0"
                      style={{
                        borderRadius: 26,
                        padding: "clamp(13px, 1.5vw, 22px)",
                        background:
                          "linear-gradient(155deg, rgba(168,61,11,0.10) 0%, rgba(168,61,11,0.035) 46%, rgba(255,255,255,0.55) 100%)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.75), 0 30px 70px rgba(26,21,18,0.13), 0 4px 12px rgba(26,21,18,0.07)",
                      }}
                      animate={
                        isActive
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: reduced ? 1 : 0.97 }
                      }
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    >
                      <div
                        className="relative overflow-hidden"
                        style={{
                          borderRadius: 15,
                          aspectRatio: "5/4",
                          background: "#E8E3DC",
                          boxShadow: "inset 0 0 0 1px rgba(26,21,18,0.07)",
                        }}
                      >
                        {panel.image ? (
                          <Image
                            src={panel.image}
                            alt={panel.imageAlt}
                            fill
                            sizes="(max-width: 1024px) 90vw, 45vw"
                            priority={panel.priority}
                            style={{ objectFit: "cover", objectPosition: "center" }}
                          />
                        ) : (
                          /* Deliberately empty. The frame holds its space so
                             the two-column composition and the alternating
                             left/right rhythm survive without artwork; it is
                             decorative, so it is hidden from assistive tech. */
                          <div
                            aria-hidden="true"
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(26,21,18,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(26,21,18,0.045) 1px, transparent 1px)",
                              backgroundSize: "28px 28px",
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  </article>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Progress — real buttons, not decorative divs */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10 rounded-full px-3 py-2 mat-thin"
          role="tablist"
          aria-label="Module navigation"
        >
          {panels.map((panel, i) => (
            <button
              key={panel.number}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={panel.name}
              onClick={() => goToPanel(i)}
              className="rounded-full"
              style={{
                height: 8,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: "transparent",
              }}
            >
              <motion.span
                className="block rounded-full"
                animate={{
                  width: active === i ? 26 : 8,
                  backgroundColor: active === i ? ACCENT : "#BFB6AA",
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                style={{ height: 8 }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
