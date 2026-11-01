import PhoneScreen from "@/components/ui/PhoneScreen";

/** What a framed phone shows: a screenshot, or a labelled placeholder. */
export type PhoneFrameScreen = {
  /** Path in /public, or null for the labelled placeholder. */
  image: string | null;
  label: string;
  /** Flat placeholder colour, ignored once `image` is set. */
  tint: string;
};

/** Default width: the home page fan's centre phone. */
export const PHONE_FRAME_W = "clamp(190px, 54vw, 262px)";

/* The bezelled phone used by the home page fan, the feature cards and the day
   slider, so every phone on the site is the same object. */
/* Layered shadow rather than one hard drop. Per §12 a bigger surface reads as
   thicker, so the outer layer is deep and soft while two tighter layers keep
   the frame anchored. `depth` lightens all of it for receded ranks — something
   further back sits closer to its ground and casts less. A negative depth
   deepens it, which is what the hover lift uses. */
export function frameShadow(depth: number) {
  const d = Math.min(depth, 2);
  return [
    `0 2px 6px rgba(15,13,10,${(0.10 - d * 0.03).toFixed(3)})`,
    `0 ${14 - d * 3}px ${32 - d * 6}px rgba(15,13,10,${(0.13 - d * 0.035).toFixed(3)})`,
    `0 ${44 - d * 10}px ${88 - d * 20}px rgba(15,13,10,${(0.20 - d * 0.055).toFixed(3)})`,
    `inset 0 1px 0 rgba(255,255,255,0.16)`,
  ].join(", ");
}

export default function PhoneFrame({
  screen,
  depth = 0,
  width = PHONE_FRAME_W,
}: {
  screen: PhoneFrameScreen;
  depth?: number;
  width?: string;
}) {
  return (
    <div
      style={{
        width,
        aspectRatio: "9 / 19.5",
        borderRadius: "clamp(28px, 7vw, 38px)",
        padding: 9,
        background: "linear-gradient(160deg, #2A2521 0%, #0F0D0A 55%, #241F1B 100%)",
        boxShadow: frameShadow(depth),
        transition: "box-shadow 240ms ease-out",
      }}
    >
      <PhoneScreen
        src={screen.image}
        alt={screen.label}
        sizes="(max-width: 768px) 58vw, 262px"
        ratio={2.28}
        background={screen.image ? "#121110" : screen.tint}
        style={{ width: "100%", height: "100%", aspectRatio: "auto" }}
      >
        {!screen.image && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          >
            <span style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
            }}>
              Placeholder
            </span>
            <span style={{
              fontSize: "clamp(15px, 4vw, 19px)", fontWeight: 700,
              letterSpacing: "-0.02em", color: "rgba(255,255,255,0.94)",
            }}>
              {screen.label}
            </span>
          </div>
        )}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", top: "1.9%", left: "50%", transform: "translateX(-50%)",
            width: "27%", height: "3.4%", minHeight: 14, borderRadius: 100, background: "#0F0D0A",
          }}
        />
      </PhoneScreen>
    </div>
  );
}

