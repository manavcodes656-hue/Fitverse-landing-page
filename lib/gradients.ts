/* Eased multi-stop gradients. A plain two-stop linear-gradient has a constant
   slope, so the eye catches the start and end of the ramp as a faint edge.
   Easing the mix (smoothstep) with many stops removes that edge and keeps the
   8-bit steps small enough not to band. Colours may be any CSS colour or var(). */

const ease = (t: number) => t * t * (3 - 2 * t);
const pct = (n: number) => `${+(n * 100).toFixed(2)}%`;

/* `color` fading in from transparent (top) to fully opaque (bottom). */
export function fadeIn(color: string, steps = 18): string {
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return `color-mix(in srgb, ${color} ${pct(ease(t))}, transparent) ${pct(t)}`;
  });
  return `linear-gradient(180deg, ${stops.join(", ")})`;
}

/* Opaque ramp from `from` (top) to `to` (bottom). */
export function blend(from: string, to: string, steps = 24): string {
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return `color-mix(in srgb, ${to} ${pct(ease(t))}, ${from}) ${pct(t)}`;
  });
  return `linear-gradient(180deg, ${stops.join(", ")})`;
}
