/* ─────────────────────────────────────────────────────────────────────────────
   FitVerse motion system
   Apple's fluid-interface model, translated to Framer Motion.

   Apple describes springs with two designer-facing parameters instead of the
   physics triplet (mass / stiffness / damping):

     · damping ratio — overshoot.  1.0 = critically damped (no bounce).
                                   < 1.0 = overshoots.  Lower = bouncier.
     · response      — how quickly the value reaches the target, in seconds.

   Framer Motion's `bounce` + `duration` spring API maps onto this directly:
     damping 1.0  ->  bounce 0
     damping 0.8  ->  bounce 0.2

   House rule: critically damped everywhere by DEFAULT. Bounce is reserved for
   motion the user physically threw — a flick, a drag release, a swipe. Overshoot
   on a menu that merely appeared reads as decoration; overshoot on a card you
   flicked reads as physics.
   ────────────────────────────────────────────────────────────────────────── */

import type { Transition } from "framer-motion";

/* ── Springs ─────────────────────────────────────────────────────────────── */

/** Default for anything the user can touch. No overshoot. */
export const spring: Transition = { type: "spring", bounce: 0, duration: 0.4 };

/** Snappier critically damped spring — small elements, icons, chips. */
export const springSnappy: Transition = { type: "spring", bounce: 0, duration: 0.28 };

/** Drawers, sheets, modals. Apple ships damping 0.8 / response 0.3 here. */
export const springSheet: Transition = { type: "spring", bounce: 0.2, duration: 0.3 };

/** Rotation — Apple ships damping 0.8 / response 0.4. */
export const springRotate: Transition = { type: "spring", bounce: 0.2, duration: 0.4 };

/* ── Non-gesture transitions ─────────────────────────────────────────────── */

/** Scroll-triggered reveals. Not interruptible by design — nothing grabs these. */
export const reveal: Transition = { duration: 0.55, ease: [0.16, 1, 0.3, 1] };

/* ── Momentum projection ─────────────────────────────────────────────────── */

/**
 * Where a flick would come to rest, using Apple's exponential-decay model from
 * the Designing Fluid Interfaces sample code.
 *
 * NOTE: this is deliberately not the physics-textbook v^2 / (2*deceleration).
 * Apple ships the decay form below, and it is what makes a flick feel thrown
 * rather than merely released.
 *
 * @param velocity px/s at the moment of release
 * @param decelerationRate 0.998 = normal scroll feel, 0.99 = snappier
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Tracks recent pointer samples so a gesture can hand its velocity to a spring. */
export class VelocityTracker {
  private samples: { value: number; t: number }[] = [];
  private readonly window = 5;

  add(value: number, t = performance.now()) {
    this.samples.push({ value, t });
    if (this.samples.length > this.window) this.samples.shift();
  }

  /** px/s across the tracked window. Returns 0 if there is not enough history. */
  get(): number {
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = last.t - first.t;
    if (dt <= 0) return 0;
    return ((last.value - first.value) / dt) * 1000;
  }

  reset() {
    this.samples = [];
  }
}

/* ── Reveal safety ───────────────────────────────────────────────────────────
   useInView with a backstop: if the observer never fires (a hidden tab, an
   embedded webview, a layout that never intersects), the content is shown after
   `ms` rather than left at opacity 0. Same 7s the hero uses. */
import { useEffect, useState, type RefObject } from "react";
import { useInView } from "framer-motion";

export function useInViewSafe(
  ref: RefObject<Element | null>,
  options: { once?: boolean; margin?: string } = {},
  ms = 7000
): boolean {
  const seen = useInView(ref, options as Parameters<typeof useInView>[1]);
  const [late, setLate] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLate(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return seen || late;
}
