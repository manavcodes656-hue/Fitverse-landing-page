import type { Metadata } from "next";
import PreviewHarness from "@/components/PreviewHarness";

/* Internal review page for the intro splash and app showcase.
   Kept out of search results and out of the sitemap. Delete this folder once
   both components are approved and wired into the real entry point. */
export const metadata: Metadata = {
  title: "Component preview — FitVerse",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <main id="main" style={{ background: "#FDFCF9", minHeight: "100svh" }}>
      <PreviewHarness />
    </main>
  );
}
