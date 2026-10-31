import { blend } from "@/lib/gradients";
import "./DarkTransition.css";

/* Plain cream to black, nothing else. Two colours only: every stop is a mix of
   the page cream (the FAQ above it) and the waitlist black below it, eased so
   the ramp has no visible start or end. */
export default function DarkTransition() {
  return (
    <div
      className="fvt"
      aria-hidden="true"
      style={{ background: blend("var(--page-bg)", "var(--bg)", 24) }}
    />
  );
}
