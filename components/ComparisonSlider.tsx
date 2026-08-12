"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

const APPS = [
  {
    name: "Nutrition",
    gradient: "linear-gradient(145deg, #064e3b 0%, #059669 100%)",
    accent: "#34d399",
    tilt: -11,
    top: "9%",
    left: "8%",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="3" x2="8" y2="10" />
        <path d="M6 3v4a2 2 0 0 0 4 0V3" />
        <line x1="8" y1="10" x2="8" y2="21" />
        <path d="M16 3c0 0 3 2.5 3 7H16" />
        <line x1="16" y1="10" x2="16" y2="21" />
      </svg>
    ),
  },
  {
    name: "Workout",
    gradient: "linear-gradient(145deg, #1e1b4b 0%, #4338ca 100%)",
    accent: "#818cf8",
    tilt: 7,
    top: "7%",
    left: "56%",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818cf8"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1"  y="11" width="4" height="7" rx="1.5" />
        <rect x="19" y="11" width="4" height="7" rx="1.5" />
        <rect x="3"  y="13" width="3" height="3" rx="1" />
        <rect x="18" y="13" width="3" height="3" rx="1" />
        <line x1="6" y1="14.5" x2="18" y2="14.5" />
      </svg>
    ),
  },
  {
    name: "Sleep",
    gradient: "linear-gradient(145deg, #2e1065 0%, #7c3aed 100%)",
    accent: "#c4b5fd",
    tilt: -6,
    top: "38%",
    left: "72%",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    name: "Meditation",
    gradient: "linear-gradient(145deg, #0c4a6e 0%, #0284c7 100%)",
    accent: "#38bdf8",
    tilt: 12,
    top: "40%",
    left: "6%",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.2" />
        <path d="M12 7.5v4" />
        <path d="M12 11.5 C10 13.5 7 14 5 13" />
        <path d="M12 11.5 C14 13.5 17 14 19 13" />
        <path d="M8.5 13.5 Q12 16 15.5 13.5" />
      </svg>
    ),
  },
  {
    name: "Community",
    gradient: "linear-gradient(145deg, #7c2d12 0%, #ea580c 100%)",
    accent: "#fb923c",
    tilt: -13,
    top: "68%",
    left: "36%",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fb923c"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="6" r="2.5" />
        <path d="M8.5 21c0-2.5 1.5-4.5 3.5-4.5s3.5 2 3.5 4.5" />
        <circle cx="5" cy="8" r="2" />
        <path d="M2 21c0-2 1.2-3.5 3-3.5" />
        <circle cx="19" cy="8" r="2" />
        <path d="M22 21c0-2-1.2-3.5-3-3.5" />
      </svg>
    ),
  },
];

export default function ComparisonSlider() {
  const [sliderPos,  setSliderPos]  = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const progress = (sliderPos - 5) / 90;
  const showLogo = sliderPos > 55;
  const afterRightInset = 100 - sliderPos;

  const getPercent = (clientX: number): number => {
    if (!cardRef.current) return sliderPos;
    const rect = cardRef.current.getBoundingClientRect();
    return Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98);
  };

  const onMouseDown  = () => setIsDragging(true);
  const onMouseMove  = (e: React.MouseEvent) => { if (isDragging) setSliderPos(getPercent(e.clientX)); };
  const onMouseUp    = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const onTouchStart = (e: React.TouchEvent) => { setIsDragging(true); setSliderPos(getPercent(e.touches[0].clientX)); };
  const onTouchMove  = (e: React.TouchEvent) => { if (isDragging) setSliderPos(getPercent(e.touches[0].clientX)); };
  const onTouchEnd   = () => setIsDragging(false);

  return (
    <section
      style={{
        backgroundColor: "#0F0D0A",
        /* Fit entirely within viewport height */
        minHeight: "100vh",
        maxHeight: "100vh",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* bg glow */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 45% at 50% 55%, rgba(59,111,232,0.06) 0%, transparent 70%)",
      }} />

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          textAlign: "center",
          marginBottom: "20px",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <p style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "8px",
        }}>
          THE PROBLEM
        </p>
        <h2 style={{
          fontSize: "clamp(22px, 3.5vw, 36px)",
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          margin: 0,
        }}>
          Too many apps. Zero clarity.
        </h2>
      </motion.div>

      {/* Three-column grid */}
      <div
        className="cs-grid"
        style={{
          maxWidth: "1100px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "clamp(16px, 3vw, 48px)",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >

        {/* LEFT TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="cs-text-left"
        >
          <h3 style={{
            fontFamily: "Inter,sans-serif",
            fontSize: "clamp(15px, 1.8vw, 22px)",
            fontWeight: 700, color: "#fff",
            lineHeight: 1.35, margin: 0,
          }}>
            Juggling 5 apps for<br />one fitness goal?
          </h3>
          <p style={{
            fontFamily: "Inter,sans-serif",
            fontSize: "clamp(12px, 1.2vw, 14px)",
            fontWeight: 400, color: "rgba(255,255,255,0.4)",
            lineHeight: 1.6, marginTop: "10px", marginBottom: 0,
          }}>
            Switching between apps means<br />losing context and missing patterns.
          </p>
        </motion.div>

        {/* CENTER: THE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Card — height capped so it stays within viewport */}
          <div
            ref={cardRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="cs-card"
            style={{
              width: "460px",
              height: "min(420px, 52vh)",
              maxWidth: "calc(100vw - 48px)",
              position: "relative",
              overflow: "hidden",
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.65)",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >

            {/* ── BEFORE LAYER ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 1,
              background: "rgba(12,12,18,0.97)",
            }}>
              {APPS.map((app, i) => {
                const origTopPct  = parseFloat(app.top);
                const origLeftPct = parseFloat(app.left);
                const targetTopPct  = 40;
                const targetLeftPct = 43;
                const p = Math.min(progress * 1.4, 1);

                const lerpedTop   = origTopPct  + (targetTopPct  - origTopPct)  * p;
                const lerpedLeft  = origLeftPct + (targetLeftPct - origLeftPct) * p;
                const lerpedTilt  = app.tilt * (1 - p);
                const lerpedScale = progress > 0.75 ? Math.max(1 - (progress - 0.75) * 6, 0) : 1;
                const lerpedOpacity = progress > 0.72 ? Math.max(1 - (progress - 0.72) * 7, 0) : 1;

                return (
                  <div
                    key={app.name}
                    style={{
                      position: "absolute",
                      top: `${lerpedTop}%`,
                      left: `${lerpedLeft}%`,
                      width: "68px",
                      height: "74px",
                      borderRadius: "18px",
                      background: app.gradient,
                      /* Stronger border for better definition */
                      boxShadow: `0 6px 20px rgba(0,0,0,0.6), 0 0 0 1.5px ${app.accent}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "8px 6px 7px",
                      transform: `rotate(${lerpedTilt}deg) scale(${lerpedScale})`,
                      opacity: lerpedOpacity,
                      willChange: "transform, opacity",
                    }}
                  >
                    {app.icon}
                    <span style={{
                      fontFamily: "Inter,sans-serif",
                      fontSize: "8px",
                      fontWeight: 700,
                      /* White text with strong shadow for maximum readability */
                      color: "#ffffff",
                      textShadow: `0 1px 4px rgba(0,0,0,0.8)`,
                      textAlign: "center",
                      lineHeight: 1.2,
                      letterSpacing: "0.01em",
                    }}>
                      {app.name}
                    </span>
                    {/* Accent corner dot */}
                    <div style={{
                      position: "absolute", top: 5, right: 5,
                      width: 5, height: 5, borderRadius: "50%",
                      background: app.accent, opacity: 0.7,
                    }} />
                  </div>
                );
              })}

              {/* BEFORE label — always visible while left panel is dominant */}
              <div style={{
                position: "absolute", bottom: 12, left: 12, zIndex: 5,
                display: "flex", alignItems: "center", gap: "5px",
                pointerEvents: "none",
              }}>
                <span style={{
                  fontFamily: "Inter,sans-serif", fontSize: "9px", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#fff",
                  background: "rgba(0,0,0,0.55)",
                  padding: "3px 7px",
                  borderRadius: "4px",
                  backdropFilter: "blur(4px)",
                }}>
                  BEFORE
                </span>
              </div>
            </div>

            {/* ── AFTER LAYER ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 2,
              background: "#0F0D0A",
              clipPath: `inset(0 ${afterRightInset}% 0 0)`,
            }}>
              <div aria-hidden style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 55% 55% at 50% 46%, rgba(196,149,106,0.18) 0%, transparent 70%)",
              }} />

              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "12px",
              }}>
                <motion.div
                  animate={showLogo
                    ? { scale: 1, opacity: 1, rotate: 0 }
                    : { scale: 0.3, opacity: 0, rotate: -60 }
                  }
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  style={{
                    width: 72, height: 72,
                    borderRadius: 18,
                    overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.jpeg"
                    alt="FitVerse logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </motion.div>

                <motion.h4
                  animate={showLogo ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: showLogo ? 0.1 : 0 }}
                  style={{
                    fontFamily: "Inter,sans-serif", fontSize: "26px",
                    fontWeight: 700, color: "white", letterSpacing: "-0.5px", margin: 0,
                  }}
                >
                  FitVerse
                </motion.h4>
              </div>

              {/* AFTER label — always readable */}
              <div style={{
                position: "absolute", bottom: 12, right: 12, zIndex: 5,
                pointerEvents: "none",
              }}>
                <span style={{
                  fontFamily: "Inter,sans-serif", fontSize: "9px", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#fff",
                  background: "rgba(196,149,106,0.55)",
                  padding: "3px 7px",
                  borderRadius: "4px",
                  backdropFilter: "blur(4px)",
                }}>
                  AFTER
                </span>
              </div>
            </div>

            {/* ── Divider line ── */}
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `calc(${sliderPos}% - 1px)`,
              width: "2px", zIndex: 3,
              background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 15%, white 50%, rgba(255,255,255,0.5) 85%, transparent 100%)",
              pointerEvents: "none",
            }} />

            {/* ── Handle with ↔ arrow ── */}
            <div style={{
              position: "absolute",
              top: "50%", left: `${sliderPos}%`,
              transform: `translate(-50%, -50%) scale(${isDragging ? 0.9 : 1})`,
              zIndex: 4,
              width: "40px", height: "40px",
              borderRadius: "50%",
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isDragging ? "0 6px 28px rgba(0,0,0,0.65)" : "0 3px 18px rgba(0,0,0,0.5)",
              cursor: isDragging ? "grabbing" : "grab",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
              pointerEvents: "none",
            }}>
              {/* ↔ double-headed arrow */}
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none"
                stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 6h16" />
                <path d="M4 2L1 6l3 4" />
                <path d="M14 2l3 4-3 4" />
              </svg>
            </div>
          </div>

          {/* Drag hint */}
          <div style={{
            marginTop: "14px",
            display: "flex", alignItems: "center", gap: "6px",
            opacity: sliderPos > 30 ? 0 : 1,
            transition: "opacity 0.35s", pointerEvents: "none",
          }}>
            <span className="nudge-left" style={{
              display: "inline-block", fontFamily: "Inter,sans-serif",
              fontSize: "12px", color: "rgba(255,255,255,0.3)",
            }}>←</span>
            <span style={{
              fontFamily: "Inter,sans-serif", fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
            }}>Drag to reveal</span>
            <span className="nudge-right" style={{
              display: "inline-block", fontFamily: "Inter,sans-serif",
              fontSize: "12px", color: "rgba(255,255,255,0.3)",
            }}>→</span>
          </div>
        </motion.div>

        {/* RIGHT TEXT */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          className="cs-text-right"
          style={{ textAlign: "right" }}
        >
          <h3 style={{
            fontFamily: "Inter,sans-serif",
            fontSize: "clamp(15px, 1.8vw, 22px)",
            fontWeight: 700, color: "#fff",
            lineHeight: 1.35, margin: 0,
          }}>
            One intelligent platform<br />for everything.
          </h3>
          <p style={{
            fontFamily: "Inter,sans-serif",
            fontSize: "clamp(12px, 1.2vw, 14px)",
            fontWeight: 400, color: "rgba(255,255,255,0.4)",
            lineHeight: 1.6, marginTop: "10px", marginBottom: 0,
          }}>
            FitVerse unifies your entire fitness<br />journey into a single adaptive system.
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 1023px) {
          .cs-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .cs-text-left, .cs-text-right {
            text-align: center !important;
          }
        }
        @media (max-width: 599px) {
          .cs-card {
            width: calc(100vw - 48px) !important;
            height: min(380px, 48vh) !important;
          }
        }
      `}</style>
    </section>
  );
}
