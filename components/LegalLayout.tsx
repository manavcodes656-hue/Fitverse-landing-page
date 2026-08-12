import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <main>
      <Navbar />
      <div className="pt-16">
        <div className="legal-page mx-auto" style={{ maxWidth: "760px", padding: "80px 24px" }}>
          <p className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-widest mb-4">
            Last updated: {lastUpdated}
          </p>
          <h1
            className="text-[#111] font-bold mb-12"
            style={{ fontSize: "40px", letterSpacing: "-0.025em", lineHeight: 1.1 }}
          >
            {title}
          </h1>
          <div className="legal-content">{children}</div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
