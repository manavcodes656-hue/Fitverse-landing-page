import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-16">
        <div className="legal-page mx-auto" style={{ maxWidth: "760px", padding: "80px 24px" }}>
          {/* #9CA3AF on this ground measures about 2.8:1 — below the minimum. */}
          <p className="text-[12px] font-medium uppercase mb-4" style={{ color: "#6B6560", letterSpacing: "0.09em" }}>
            Last updated: {lastUpdated}
          </p>
          <h1
            className="font-bold mb-12"
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              color: "#1A1512",
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
              textWrap: "balance",
            }}
          >
            {title}
          </h1>
          <div className="legal-content">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
