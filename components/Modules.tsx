"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    image: "/aicoach.png",
    imageAlt: "FitVerse AI Coach personalized guidance",
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
    image: "/nutrition tracker.png",
    imageAlt: "FitVerse nutrition tracking and meal scanning",
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
    image: "/workout log.png",
    imageAlt: "FitVerse workout tracking and progress",
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
    image: "/sleep monitor.png",
    imageAlt: "FitVerse sleep monitoring and recovery",
    imageRight: false,
    bg: "#F5F0E8",
    priority: false,
  },
];

const totalPanels = panels.length;

export default function Modules() {
  const scrollSection = useRef<HTMLDivElement>(null);
  const innerRef      = useRef<HTMLDivElement>(null);
  const currentXRef   = useRef(0);
  const targetXRef    = useRef(0);
  const rafRef        = useRef<number>(0);
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = scrollSection.current;
      if (!section) return;
      const rect        = section.getBoundingClientRect();
      const scrolled    = -rect.top;
      const totalScroll = section.offsetHeight - window.innerHeight;
      const progress    = Math.min(Math.max(scrolled / totalScroll, 0), 1);
      const maxTranslate = (totalPanels - 1) * window.innerWidth;
      targetXRef.current = progress * maxTranslate;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
    const animate = () => {
      currentXRef.current = lerp(currentXRef.current, targetXRef.current, 0.12);
      if (innerRef.current) {
        innerRef.current.style.transform = `translateX(${-currentXRef.current}px)`;
      }
      const panelWidth = window.innerWidth;
      if (panelWidth > 0) {
        const active = Math.min(
          totalPanels - 1,
          Math.max(0, Math.round(currentXRef.current / panelWidth))
        );
        setActivePanel(active);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      id="modules"
      ref={scrollSection}
      className="relative"
      style={{ height: `${(totalPanels + 1) * 100}vh` }}
      aria-label="Fitness Modules"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          ref={innerRef}
          className="flex h-full"
          style={{ width: `${totalPanels * 100}vw`, willChange: "transform", transition: "none" }}
        >
          {panels.map((panel, i) => {
            const isActive = activePanel === i;
            return (
              <div
                key={panel.number}
                className="flex-shrink-0 h-full flex items-center"
                style={{ width: "100vw", backgroundColor: panel.bg }}
              >
                <div className="w-full max-w-7xl mx-auto px-8 lg:px-16">
                  <article className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${!panel.imageRight ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`}>
                    {/* Text */}
                    <motion.div
                      className="flex flex-col justify-center"
                      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span
                        className="font-extrabold leading-none mb-4 select-none"
                      style={{ fontSize: "72px", color: "#C4956A", fontWeight: 800 }}
                      >
                        {panel.number}
                      </span>
                      <h2
                        style={{
                          fontSize: "clamp(32px, 4vw, 48px)",
                          fontWeight: 700,
                          color: "#111111",
                          lineHeight: 1.1,
                          letterSpacing: "-0.02em",
                          marginBottom: "12px",
                        }}
                      >
                        {panel.name}
                      </h2>
                      <p style={{ fontSize: "18px", fontWeight: 600, color: "#111111", lineHeight: 1.4, marginBottom: "16px" }}>
                        {panel.subtitle}
                      </p>
                      <p style={{ fontSize: "16px", color: "#6B7280", lineHeight: 1.7, maxWidth: "380px" }}>
                        {panel.description}
                      </p>
                    </motion.div>

                    {/* Image */}
                    <div className="relative">
                      <motion.div
                        className="overflow-hidden relative"
                        style={{ borderRadius: "20px", aspectRatio: "4/3", background: "#E8E3DC" }}
                        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {panel.image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={panel.image}
                            alt={panel.imageAlt}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center center",
                              display: "block",
                            }}
                            loading={panel.priority ? "eager" : "lazy"}
                          />
                        )}
                      </motion.div>
                    </div>
                  </article>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {panels.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width:           i === activePanel ? 24 : 8,
                backgroundColor: i === activePanel ? "#C4956A" : "#d1c9bf",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
