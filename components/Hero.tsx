"use client";

import { useRef, useState } from "react";
import GlowBand from "@/components/GlowBand";
import { useDemoReveal } from "./hero/useDemoReveal";
import "./Hero.css";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /* Phones only: autoplay was refused, so show the first frame with one play button. */
  const [needsTap, setNeedsTap] = useState(false);

  useDemoReveal(rootRef, demoRef, videoRef, setNeedsTap);

  return (
    <section ref={rootRef} className="fvh pre" aria-label="FitVerse">
      <div className="fvh-hero">
        <div className="fvh-glow" aria-hidden="true" />
        <div className="fvh-grain" aria-hidden="true" />

        <div className="fvh-hero-inner" id="top">
          <h1 className="fvh-wordmark">FitVerse</h1>
          <p className="fvh-tagline">
            One app, <span className="fvh-accent">Your whole body,</span> everyday.
          </p>
          <p className="fvh-sub">
            Your fitness, finally in one app. FitVerse tracks your nutrition, sleep and workouts, understands how they connect, and gives you a personal coach that adapts as you change.
          </p>
        </div>
      </div>

      <div className="fvh-field">
        <GlowBand />

        <section ref={demoRef} className="fvh-demo" id="demo" aria-label="FitVerse in action">
          <div className="fvh-frame">
            <div className="fvh-inner">
              <video
                ref={videoRef}
                src="/fitverse-demo.mp4"
                poster="/fitverse-demo-poster.jpg"
                controls
                playsInline
                muted
                loop
                preload="auto"
              />
              {needsTap && (
                <button
                  type="button"
                  className="fvh-play"
                  aria-label="Play demo video"
                  onClick={() => { setNeedsTap(false); videoRef.current?.play()?.catch(() => setNeedsTap(true)); }}
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
