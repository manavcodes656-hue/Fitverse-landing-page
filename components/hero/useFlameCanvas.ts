import { useEffect, type RefObject } from "react";

/* Palette from the site tokens: bg, orange, orange-bright, orange-glow, ink. */
const FLAME_STOPS: [number, [number, number, number]][] = [
  [0.0, [18, 17, 16]],
  [0.22, [58, 26, 13]],
  [0.42, [122, 52, 22]],
  [0.58, [196, 82, 31]],
  [0.72, [232, 116, 61]],
  [0.84, [242, 160, 110]],
  [0.90, [247, 190, 150]],
  [0.94, [250, 212, 180]],
  [0.97, [252, 232, 214]],
  [1.0, [253, 252, 249]], // replaced at runtime by --page-bg, the page cream
];

/* Read the page cream from the global token so the canvas and the sections
   below it can never drift apart. */
function readCream(): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = "var(--page-bg)";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g);
  probe.remove();
  return m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : FLAME_STOPS[FLAME_STOPS.length - 1][1];
}

export function useFlameCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  /* Animated flame band. Renders at quarter scale and upsamples with smoothing. */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, BAND = 300, lw = 0, lh = 0, t = 0;
    let off: HTMLCanvasElement | null = null, octx: CanvasRenderingContext2D | null = null, img: ImageData | null = null;
    let raf: number | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;

    const STOPS = FLAME_STOPS.map((s) => [s[0], s[1]] as typeof s);
    STOPS[STOPS.length - 1][1] = readCream();
    const LUT = new Uint8ClampedArray(256 * 3);
    for (let k = 0; k < 256; k++) {
      const v = k / 255;
      let a = STOPS[0], b = STOPS[STOPS.length - 1];
      for (let q = 0; q < STOPS.length - 1; q++) {
        if (v >= STOPS[q][0] && v <= STOPS[q + 1][0]) {
          a = STOPS[q];
          b = STOPS[q + 1];
          break;
        }
      }
      let f = (v - a[0]) / Math.max(1e-6, b[0] - a[0]);
      f = f * f * (3 - 2 * f);
      for (let ch = 0; ch < 3; ch++) LUT[k * 3 + ch] = a[1][ch] + (b[1][ch] - a[1][ch]) * f;
    }

    const resize = () => {
      const r = c.getBoundingClientRect();
      W = r.width;
      H = r.height;
      BAND = Math.min(300, H);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lw = Math.max(80, Math.round(W / 4));
      lh = Math.max(40, Math.min(600, Math.round(H / 4)));
      off = document.createElement("canvas");
      off.width = lw;
      off.height = lh;
      octx = off.getContext("2d"); // null if the browser is out of canvas memory; draw() then skips
      img = octx ? octx.createImageData(lw, lh) : null;
    };

    const crestAt = (u: number) =>
      0.46 +
      0.14 * Math.sin(u * 3.1 + 0.6 + t * 0.4) +
      0.07 * Math.sin(u * 7.3 - 1.9 - t * 0.55) +
      0.035 * Math.sin(u * 13.7 + 2.4 + t * 0.3);

    const draw = () => {
      if (!off || !octx || !img) return;
      const d = img.data;
      let p = 0;
      for (let j = 0; j < lh; j++) {
        const ypx = (j / lh) * H;
        for (let i = 0; i < lw; i++) {
          const u = i / lw;
          const crest = crestAt(u) * BAND;
          const dd = ypx - crest;
          let v: number;
          if (dd < 0) {
            v = 0.5 * Math.exp(dd / (BAND * 0.11));
          } else {
            const room = BAND - crest;
            const pk = room * (0.55 + 0.15 * (1 - crest / BAND));
            if (dd < pk) {
              const g = dd / pk;
              v = 0.5 + 0.42 * Math.pow(g, 1.6);
            } else {
              /* Below the peak: ease down to brand orange (behind the top of the
                 video), then keep lightening through pale orange to the page
                 cream, which is reached exactly at the bottom edge. */
              const h = Math.min(1, (dd - pk) / Math.max(1, H - crest - pk));
              const trough = 0.7 + 0.04 * Math.sin(u * 5.3 + t * 0.28);
              if (h < 0.3) {
                const s = h / 0.3;
                v = 0.92 + (trough - 0.92) * (s * s * (3 - 2 * s));
              } else {
                const s = (h - 0.3) / 0.7;
                v = trough + (1 - trough) * (s * s * (3 - 2 * s));
              }
            }
          }
          const k = Math.max(0, Math.min(255, (v * 255) | 0)) * 3;
          d[p] = LUT[k];
          d[p + 1] = LUT[k + 1];
          d[p + 2] = LUT[k + 2];
          d[p + 3] = 255;
          p += 4;
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, lw, lh, 0, 0, W, H);
    };

    const loop = () => {
      t += 0.016;
      try {
        draw();
      } catch {
        raf = null; // the CSS gradient behind the canvas stays; stop drawing
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); draw(); }, 120);
    };
    const onVisibility = () => {
      if (reduce) return;
      if (document.hidden) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      } else if (raf === null) {
        loop();
      }
    };

    resize();
    draw();
    if (!reduce) loop();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [canvasRef]);
}
