"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

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
    bg: "#FDFCF9",
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
      className="relative"
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
                          fontSize: "clamp(48px, 6vw, 72px)",
                          color: "#A83D0B",
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {panel.number}
                      </span>
                      <h3
                        style={{
                          fontSize: "clamp(32px, 4vw, 48px)",
                          fontWeight: 700,
                          color: "#1A1512",
                          lineHeight: 1.08,
                          letterSpacing: "-0.025em",
                          marginBottom: "12px",
                        }}
                      >
                        {panel.name}
                      </h3>
                      <p
                        style={{
                          fontSize: "clamp(17px, 1.8vw, 19px)",
                          fontWeight: 600,
                          color: "#1A1512",
                          lineHeight: 1.35,
                          letterSpacing: "-0.01em",
                          marginBottom: "16px",
                        }}
                      >
                        {panel.subtitle}
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#57514B",
                          lineHeight: 1.65,
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
                  backgroundColor: active === i ? "#A83D0B" : "#BFB6AA",
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
