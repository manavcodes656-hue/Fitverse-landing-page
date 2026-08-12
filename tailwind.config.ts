import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:   ["Outfit","var(--font-outfit)","Inter","var(--font-inter)","-apple-system","BlinkMacSystemFont","Helvetica Neue","Arial","sans-serif"],
        outfit: ["Outfit","var(--font-outfit)","sans-serif"],
        inter:  ["Inter","var(--font-inter)","sans-serif"],
      },
      colors: {
        /* ── Backgrounds ── */
        "bg-primary":  "#FDFCF9",
        "bg-surface":  "#F5F0E8",
        "bg-dark":     "#0F0D0A",
        "bg-card":     "#FFFFFF",

        /* ── Text ── */
        "text-primary":   "#1A1512",
        "text-secondary": "#6B6560",
        "text-muted":     "#A39E98",
        "text-inverse":   "#FDFCF9",

        /* ── Accents ── */
        "accent":      "#C4956A",   /* warm amber — primary accent */
        "accent-dark": "#1A1512",   /* CTA on light bg */
        "accent-glass":"rgba(255,255,255,0.12)",

        /* ── Brand ── */
        brand: {
          amber: "#C4956A",
          dark:  "#0F0D0A",
          warm:  "#FDFCF9",
          cream: "#F5F0E8",
        },
      },
      fontSize: {
        "display": ["clamp(56px,9vw,96px)",  { lineHeight:"1.0",  letterSpacing:"-3px",    fontWeight:"900" }],
        "h1":      ["clamp(40px,6vw,72px)",  { lineHeight:"1.05", letterSpacing:"-2px",    fontWeight:"800" }],
        "h2":      ["clamp(28px,4vw,48px)",  { lineHeight:"1.1",  letterSpacing:"-0.02em", fontWeight:"700" }],
        "h3":      ["clamp(20px,2.5vw,32px)",{ lineHeight:"1.2",  letterSpacing:"-0.015em",fontWeight:"600" }],
        "body-lg": ["clamp(15px,1.6vw,18px)",{ lineHeight:"1.6",  letterSpacing:"0",       fontWeight:"400" }],
        "body":    ["clamp(14px,1.5vw,16px)",{ lineHeight:"1.6",  letterSpacing:"0",       fontWeight:"400" }],
        "small":   ["14px", { lineHeight:"1.5", fontWeight:"400" }],
        "micro":   ["12px", { lineHeight:"1.4", letterSpacing:"0.04em", fontWeight:"500" }],
      },
      animation: {
        "scroll":      "scroll 40s linear infinite",
        "pulse-soft":  "pulse-soft 1.8s ease-in-out infinite",
        "nudge-left":  "nudge-left 2s ease-in-out infinite",
        "nudge-right": "nudge-right 2s ease-in-out 0.15s infinite",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
      },
      keyframes: {
        scroll:       { "0%":{ transform:"translateX(0)" }, "100%":{ transform:"translateX(-50%)" } },
        "pulse-soft": { "0%,100%":{ opacity:"1" }, "50%":{ opacity:"0.5" } },
        "nudge-left":  { "0%":{ transform:"translateX(0)" }, "30%":{ transform:"translateX(-3px)" }, "60%":{ transform:"translateX(2px)" }, "100%":{ transform:"translateX(0)" } },
        "nudge-right": { "0%":{ transform:"translateX(0)" }, "30%":{ transform:"translateX(3px)" },  "60%":{ transform:"translateX(-2px)" }, "100%":{ transform:"translateX(0)" } },
        "bounce-slow": { "0%,100%":{ transform:"translateY(0)" }, "50%":{ transform:"translateY(4px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
