"use client";

import { motion } from "framer-motion";

export default function Hero() {
  const scrollToFooter = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100vh" }}
      aria-label="Introduction Hero"
    >
      {/* ── Video background ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero-video"
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          zIndex: 0,
        }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* ── Cinematic overlay — richer, darker, makes video pop ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          /* Multi-layer gradient: dark top (nav legibility) →
             lighter mid (show the subject) →
             dark bottom (text legibility) */
          background: `
            linear-gradient(
              to bottom,
              rgba(10,8,5,0.55) 0%,
              rgba(10,8,5,0.15) 35%,
              rgba(10,8,5,0.20) 60%,
              rgba(10,8,5,0.70) 100%
            )
          `,
        }}
      />
      {/* Vignette — darkens edges, focuses eye to center */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(5,4,2,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Content — centered ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{ zIndex: 2 }}
      >
        <motion.div
          className="flex flex-col items-center text-center max-w-3xl mx-auto w-full"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(56px, 9vw, 96px)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.0,
              letterSpacing: "-3px",
              textShadow: "0 2px 40px rgba(0,0,0,0.3)",
              marginBottom: "20px",
            }}
          >
            FitVerse
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: "clamp(17px, 2.2vw, 22px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.55,
              letterSpacing: "0.01em",
              marginBottom: "44px",
              maxWidth: "520px",
            }}
          >
            Your nutrition. Your workouts. Your sleep.{" "}
            <em style={{ fontStyle: "normal", color: "rgba(255,255,255,0.55)" }}>
              One system.
            </em>
          </p>

          {/* Single CTA — centered */}
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Pulse ring */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                borderRadius: "100px",
                border: "2px solid rgba(255,255,255,0.35)",
                animation: "pulse-ring 1.8s ease-out infinite",
                pointerEvents: "none",
              }}
            />
            <motion.button
              onClick={scrollToFooter}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.92)", y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                background: "white",
                color: "#1A1512",
                borderRadius: "100px",
                padding: "16px 44px",
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: "Inter,sans-serif",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                position: "relative",
                zIndex: 1,
                letterSpacing: "-0.01em",
              }}
            >
              Get Early Access
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "100px",
          padding: "6px 14px",
        }}
      >
        <span style={{
          fontFamily: "Inter,sans-serif",
          fontSize: "11px", fontWeight: 400,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.06em",
        }}>
          scroll
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ animation: "bounce-slow 2s ease-in-out infinite" }}
        >
          <path d="M6 2v8M3 7l3 3 3-3"
            stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  );
}
