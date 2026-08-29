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

/** Momentum release: only after a flick, drag-release or swipe. */
export const springMomentum: Transition = { type: "spring", bounce: 0.2, duration: 0.4 };

/** Drawers, sheets, modals. Apple ships damping 0.8 / response 0.3 here. */
export const springSheet: Transition = { type: "spring", bounce: 0.2, duration: 0.3 };

/** Rotation — Apple ships damping 0.8 / response 0.4. */
export const springRotate: Transition = { type: "spring", bounce: 0.2, duration: 0.4 };

/* ── Non-gesture transitions ─────────────────────────────────────────────── */

/** Scroll-triggered reveals. Not interruptible by design — nothing grabs these. */
export const reveal: Transition = { duration: 0.55, ease: [0.16, 1, 0.3, 1] };

/** The reduced-motion substitute: a short cross-fade, no travel. */
export const crossFade: Transition = { duration: 0.2, ease: "easeOut" };

/* ── Reduced motion ──────────────────────────────────────────────────────── */

/**
 * Reduced motion does not mean *no* feedback — it means a gentler,
 * non-vestibular equivalent. Swap travel for opacity, drop overshoot,
 * keep the state change legible.
 */
export function motionSafe(t: Transition, reduced: boolean | null): Transition {
  return reduced ? crossFade : t;
}

/** Strip positional travel from a variant when the user asked for less motion. */
export function offsetSafe<T extends Record<string, unknown>>(
  offset: T,
  reduced: boolean | null
): T | Record<string, never> {
  return reduced ? {} : offset;
}

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

/**
 * Progressive resistance past a boundary. A hard stop reads as "frozen";
 * continuous resistance reads as "responsive, but there is nothing more here".
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
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
