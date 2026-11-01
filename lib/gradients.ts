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

/* Opaque ramp through several colours (top to bottom). `stops` are [colour,
   position 0..1] pairs; each segment is eased the way `blend` is, so the joins
   between colours have no visible edge. */
export function ramp(stops: [string, number][], stepsPerSegment = 8): string {
  const out: string[] = [];
  for (let s = 0; s < stops.length - 1; s++) {
    const [from, p0] = stops[s];
    const [to, p1] = stops[s + 1];
    for (let i = s === 0 ? 0 : 1; i <= stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      out.push(`color-mix(in srgb, ${to} ${pct(ease(t))}, ${from}) ${pct(p0 + (p1 - p0) * t)}`);
    }
  }
  return `linear-gradient(180deg, ${out.join(", ")})`;
}
