"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  /* A full-viewport moving background is exactly what reduced-motion users are
     asking to be spared. Hold the first frame instead of removing the imagery —
     the composition survives, the movement does not. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduced) v.pause();
    else v.play().catch(() => { /* autoplay blocked; poster stands in */ });
  }, [reduced]);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 560 }}
      aria-labelledby="hero-heading"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-poster.webp"
        aria-hidden="true"
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
        {/* AV1 first: ~30% smaller than the H.264 below. Browsers that can't
            decode av01 skip this source and fall through to the mp4, so the
            codec string failing closed is safe. */}
        <source src="/hero-video-av1.mp4" type='video/mp4; codecs="av01.0.05M.08"' />
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Legibility scrim — dark at top for the nav, dark at the base for type,
          open through the middle so the footage still reads. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: `linear-gradient(
            to bottom,
            rgba(10,8,5,0.58) 0%,
            rgba(10,8,5,0.18) 34%,
            rgba(10,8,5,0.26) 58%,
            rgba(10,8,5,0.78) 100%
          )`,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(5,4,2,0.55) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ zIndex: 2 }}>
        <motion.div
          className="flex flex-col items-center text-center mx-auto w-full"
          style={{ maxWidth: "min(46rem, 92vw)" }}
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.7 }}
        >
          <h1
            id="hero-heading"
            style={{
              /* Tracking is size-specific and expressed in em, so it stays
                 proportional as the headline scales. A fixed px value is
                 correct at exactly one width and wrong everywhere else. */
              fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              textShadow: "0 2px 40px rgba(0,0,0,0.35)",
              marginBottom: "1.25rem",
              textWrap: "balance",
            }}
          >
            FitVerse
          </h1>

          <p
            style={{
              fontSize: "clamp(1.0625rem, 2.1vw, 1.3125rem)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.55,
              letterSpacing: "-0.005em",
              marginBottom: "2.5rem",
              maxWidth: "34rem",
              textWrap: "pretty",
            }}
          >
            One system for the way you live, train, eat, and recover.{" "}
            <br />
            <br />
            <span style={{ color: "rgba(255,255,255,0.62)" }}>Launching soon.</span>
          </p>

          {/* The pulsing ring that used to wrap this button is gone, along with
              its 32px drop shadow: two attention devices on the single most
              important control was the loudest thing on the site. The button
              now carries the hierarchy on fill and size alone. */}
          <Button
            size="lg"
            ground="dark"
            onClick={scrollToWaitlist}
            style={{ paddingLeft: 40, paddingRight: 40 }}
          >
            Get early access
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.26)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 100,
          padding: "6px 14px",
        }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 500, color: "rgba(255,255,255,0.78)", letterSpacing: "0.06em" }}>
          scroll
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={reduced ? undefined : { animation: "bounce-slow 2s ease-in-out infinite" }}
        >
          <path d="M6 2v8M3 7l3 3 3-3" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}
