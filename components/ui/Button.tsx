"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   The button system.

   Before this file the "same" button was re-declared inline in six components,
   which is why one action shipped with four corner radii, five font sizes and
   three different hover behaviours. Every button now resolves from here.

   Three decisions worth keeping:

   1. Capsule everywhere. The site was already ~80% capsule and its character is
      warm and editorial rather than technical, so the two rounded-rectangle
      outliers (the footer submit at 14px, the pricing CTAs at 12px) resolve
      toward the majority rather than the other way round.

   2. The accent stays an accent. Primaries are ink or paper, never orange.
      Orange marks the highlighted plan, the open FAQ row and the focus ring —
      if every button were orange, none of those would read as special.

   3. Contact shadow, never a float. A button sits on the surface. The 32px
      blur the hero CTA used to carry is the language of a floating card.
   ────────────────────────────────────────────────────────────────────────── */

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { springSnappy } from "@/lib/motion";
import type { CSSProperties, ReactNode } from "react";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg";
/** Which surface the button sits on. The same variant flips fill accordingly. */
export type ButtonGround = "light" | "dark";

/* 44px is Apple's minimum touch target, so `md` is the default and the only
   size used anywhere a finger can reach. `sm` is desktop chrome only. */
const SIZES: Record<ButtonSize, { h: number; px: number; fs: number }> = {
  sm: { h: 34, px: 16, fs: 13.5 },
  md: { h: 44, px: 24, fs: 15 },
  lg: { h: 52, px: 32, fs: 16 },
};

/** Icon buttons are the same rule at square aspect. */
const ICON_SIZES: Record<ButtonSize, number> = { sm: 34, md: 40, lg: 44 };

type Palette = { bg: string; fg: string; hoverBg: string; shadow?: string };

function palette(variant: ButtonVariant, ground: ButtonGround): Palette {
  const dark = ground === "dark";
  switch (variant) {
    case "primary":
      return dark
        ? { bg: "#FDFCF9", fg: "#1A1512", hoverBg: "#FFFFFF", shadow: "0 1px 2px rgba(0,0,0,0.18)" }
        : { bg: "#1A1512", fg: "#FDFCF9", hoverBg: "#2A2521", shadow: "0 1px 2px rgba(26,21,18,0.16)" };
    /* The single sanctioned accent button. It exists so the highlighted
       pricing plan can carry the accent without every other primary on the
       site reaching for it. Hover is a tint of the same orange, the way the
       ink primary tints to #2A2521. */
    case "accent":
      return { bg: "#A83D0B", fg: "#FDFCF9", hoverBg: "#C2470D", shadow: "0 1px 2px rgba(26,21,18,0.16)" };
    case "secondary":
    case "icon":
      return dark
        ? { bg: "rgba(255,255,255,0.12)", fg: "#FDFCF9", hoverBg: "rgba(255,255,255,0.19)" }
        : { bg: "rgba(26,21,18,0.05)", fg: "#1A1512", hoverBg: "rgba(26,21,18,0.09)" };
    case "ghost":
      return dark
        ? { bg: "transparent", fg: "rgba(255,255,255,0.85)", hoverBg: "rgba(255,255,255,0.10)" }
        : { bg: "transparent", fg: "#1A1512", hoverBg: "rgba(26,21,18,0.05)" };
  }
}

type OwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ground?: ButtonGround;
  /** Renders an anchor instead of a button. Handlers and copy are unaffected. */
  href?: string;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
};

export type ButtonProps = OwnProps &
  Omit<HTMLMotionProps<"button">, keyof OwnProps | "ref">;

export default function Button({
  variant = "primary",
  size = "md",
  ground = "light",
  href,
  fullWidth,
  children,
  className,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const reduced = useReducedMotion();
  const p = palette(variant, ground);
  const isIcon = variant === "icon";
  const s = SIZES[size];
  const d = ICON_SIZES[size];

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    /* One radius for every button on the site. */
    borderRadius: 999,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    background: p.bg,
    color: p.fg,
    boxShadow: p.shadow,
    textDecoration: "none",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.45 : 1,
    /* Colour is not something a pointer can grab mid-flight, so it stays on a
       timed transition; everything grabbable below is a spring. */
    transition: "background-color 0.22s ease, color 0.22s ease",
    ...(isIcon
      ? { width: d, height: d, padding: 0, flexShrink: 0 }
      : {
          height: s.h,
          padding: `0 ${s.px}px`,
          fontSize: s.fs,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          width: fullWidth ? "100%" : undefined,
        }),
    ...style,
  };

  /* Feedback lands on pointer-down, and springs back critically damped: the
     user hovered, they did not throw anything, so no overshoot. Under reduced
     motion the scale is dropped but the fill change stays — a gentler
     equivalent, not an absence of feedback. */
  const motionProps = {
    whileHover: disabled ? undefined : { scale: reduced ? 1 : 1.02, backgroundColor: p.hoverBg },
    whileTap: disabled || reduced ? undefined : { scale: isIcon ? 0.94 : 0.97 },
    transition: springSnappy,
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={className}
        style={base}
        {...motionProps}
        {...(rest as HTMLMotionProps<"a">)}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      className={className}
      style={base}
      disabled={disabled}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
