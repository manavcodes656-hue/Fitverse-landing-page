"use client";

import { useState } from "react";
import IntroAnimation from "@/components/IntroAnimation";
import AppShowcase from "@/components/AppShowcase";
import Button from "@/components/ui/Button";

/* Review harness. Not part of the site — delete app/preview/ and this file
   once both components are signed off and wired in. */
export default function PreviewHarness() {
  const [runId, setRunId] = useState(0);
  const [splashOn, setSplashOn] = useState(true);

  return (
    <>
      {splashOn && (
        <IntroAnimation
          key={runId}
          /* Replays on every mount so it is actually reviewable. In the real
             wiring this stays true, so it runs once per session. */
          oncePerSession={false}
          onDone={() => setSplashOn(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-10">
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#A83D0B",
            marginBottom: 12,
          }}
        >
          Review harness · not part of the site
        </p>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: "#1A1512",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 14,
          }}
        >
          Intro splash &amp; app showcase
        </h1>
        <p style={{ fontSize: 16, color: "#57514B", lineHeight: 1.6, maxWidth: "60ch" }}>
          The splash ran on load. Replay it below, then scroll down for the
          showcase. Neither component is wired into the live site yet.
        </p>

        <div className="flex flex-wrap gap-3 mt-7">
          <Button onClick={() => { setRunId((n) => n + 1); setSplashOn(true); }}>
            Replay intro splash
          </Button>
          <Button href="/" variant="secondary">
            Back to site
          </Button>
        </div>

        <p style={{ fontSize: 13.5, color: "#6B6560", lineHeight: 1.6, marginTop: 22, maxWidth: "62ch" }}>
          Tip: toggle <strong>Reduce motion</strong> in your OS settings and reload —
          the splash becomes a plain logo fade and the showcase becomes a static
          grid, with no scroll-linked movement at all.
        </p>
      </div>

      <AppShowcase />

      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p style={{ fontSize: 14, color: "#6B6560" }}>
          End of harness — scroll room so the showcase can finish its sequence.
        </p>
      </div>
    </>
  );
}
