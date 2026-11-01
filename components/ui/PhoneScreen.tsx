import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   One clipped phone screen, shared by the Features page and the home page fan.

   The screenshots are opaque rectangles: outside the phone's own rounded screen
   their four corners are solid light cream (#EDECE3), not transparent. Clipping
   them with a smaller radius than the screen's own leaves that cream poking out
   around dark screens. Measured on the source files, the screen's corner radius
   is ~12.8% of the image width, so the clip here is 15% — a couple of pixels
   past it, which only ever trims dark pixels. The wrapper is dark too, so a
   sub-pixel seam at the curve reads as dark, never light.

   Percent radii are relative to each side, so the vertical radius is
   RADIUS_PCT / ratio (height over width) to keep the corner circular.
   ────────────────────────────────────────────────────────────────────────── */
const RADIUS_PCT = 15;
const SCREENSHOT_RATIO = 1387 / 640;

export default function PhoneScreen({
  src,
  alt = "",
  sizes,
  priority,
  ratio = SCREENSHOT_RATIO,
  background = "#121110",
  className,
  style,
  children,
}: {
  src?: string | null;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  /** Height over width of the box this fills. Only the corner shape depends on it. */
  ratio?: number;
  background?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        aspectRatio: `1 / ${ratio}`,
        borderRadius: `${RADIUS_PCT}% / ${(RADIUS_PCT / ratio).toFixed(2)}%`,
        background,
        /* Forces the rounded clip on Safari and Android WebView, where
           overflow: hidden alone can leak a composited child's corners. */
        WebkitMaskImage: "-webkit-radial-gradient(white, black)",
        ...style,
      }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover", display: "block" }}
        />
      )}
      {children}
    </div>
  );
}
