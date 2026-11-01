"use client";

import { useRef } from "react";
import { fadeIn } from "@/lib/gradients";
import { useFlameCanvas } from "./hero/useFlameCanvas";
import "./Hero.css";

/* The orange glow band under the dark hero: a pixel-flame canvas that fades
   into the page cream. Used by the home hero and the features hero so the two
   cannot drift apart. It positions itself against the nearest `.fvh-field`
   (60px of its own flame sits above it, 40px below), so it must be rendered
   inside one. The ramp takes the top 80% of the cream layer; the last 20% is
   solid cream, not a fade to transparent, so the join never depends on the
   canvas underneath. */
export default function GlowBand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFlameCanvas(canvasRef);

  return (
    <div className="fvh-flame-wrap" aria-hidden="true">
      <div className="fvh-flame-bloom" />
      <canvas ref={canvasRef} className="fvh-flame" />
      <div className="fvh-flame-grid" />
      <div className="fvh-flame-fade" />
      <div
        className="fvh-flame-cream"
        style={{
          background: `linear-gradient(var(--page-bg), var(--page-bg)) bottom / 100% 20% no-repeat, ${fadeIn("var(--page-bg)")} top / 100% 80% no-repeat`,
        }}
      />
    </div>
  );
}
