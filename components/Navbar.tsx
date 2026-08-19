"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ── Pricing Modal ───────────────────────────────────────────────────────── */
function PricingModal({ onClose, onJoinWaitlist }: { onClose: () => void; onJoinWaitlist: () => void }) {
  const plans: {
    label: string; price: string; per: string; billing: string;
    highlight: boolean; badge?: string; features: string[]; cta: string;
  }[] = [
    {
      label: "Monthly", price: "₹299", per: "/mo", billing: "billed monthly",
      highlight: false,
      features: ["Nutrition tracking","Workout library and logging","Sleep tracking","AI Coach (10 queries/day)","Basic analytics"],
      cta: "Join the waitlist",
    },
    {
      label: "6 Months", price: "₹199", per: "/mo", billing: "billed ₹1,194 every 6 months · save 33%",
      highlight: true, badge: "Best balance",
      features: ["Everything in Monthly","Unlimited AI Coach queries","Advanced analytics","Priority email support","Early access to new features"],
      cta: "Join the waitlist",
    },
    {
      label: "Yearly", price: "₹149", per: "/mo", billing: "billed ₹1,788/year · save 50%",
      highlight: false,
      features: ["Everything in 6 Months","Priority support (24h response)","Community access","Annual health report","Locked-in launch pricing"],
      cta: "Join the waitlist",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#FDFCF9] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(26,21,18,0.08)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#A39E98", marginBottom:4 }}>Pricing</p>
              <h2 style={{ fontSize:28, fontWeight:700, color:"#1A1512", letterSpacing:"-0.025em" }}>Simple, transparent pricing.</h2>
              <p style={{ fontSize:14, color:"#A39E98", marginTop:4 }}>Cancel anytime. No hidden fees. Nothing is charged before launch.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color:"#A39E98" }} aria-label="Close pricing">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.label}
              className="relative rounded-xl p-6 flex flex-col"
              style={plan.highlight
                ? { background: "#1A1512", color: "white", outline: "2px solid #C4956A" }
                : { background: "#F5F0E8", border: "1px solid rgba(26,21,18,0.08)" }
              }
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ background:"#FDFCF9", color:"#C4956A", border:"1px solid rgba(26,21,18,0.08)", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                  {plan.badge}
                </span>
              )}
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#A39E98" }}>
                {plan.label}
              </p>
              <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:2 }}>
                <span style={{ fontSize:40, fontWeight:700, letterSpacing:"-0.025em", color: plan.highlight ? "white" : "#1A1512" }}>{plan.price}</span>
                <span style={{ fontSize:14, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#A39E98" }}>{plan.per}</span>
              </div>
              <p style={{ fontSize:11, color: plan.highlight ? "rgba(255,255,255,0.35)" : "#A39E98", marginBottom:18 }}>{plan.billing}</p>
              <ul style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20, flex:1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                      <path d="M2.5 7l3 3 6-6" stroke={plan.highlight ? "#C4956A" : "#C4956A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize:13, lineHeight:1.5, color: plan.highlight ? "rgba(255,255,255,0.75)" : "#6B6560" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                onClick={onJoinWaitlist}
                whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  padding:"12px 0", borderRadius:12, fontSize:13, fontWeight:600,
                  background: plan.highlight ? "#C4956A" : "#1A1512",
                  color: "white", border: "none", cursor: "pointer",
                }}
              >
                {plan.cta}
              </motion.button>
            </div>
          ))}
        </div>
        <p className="text-center pb-6" style={{ fontSize:12, color:"#A39E98" }}>
          Prices in INR. 7-day free trial on all plans. FitVerse is pre-launch — billing begins only once the app is live, and waitlist members get launch pricing first.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ── App Store Badges ─────────────────────────────────────────────────────── */
function AppStoreBadge({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="relative group cursor-not-allowed select-none"
      style={{ opacity: scrolled ? 0.65 : 0.7 }}
      aria-label="App Store — Coming Soon"
    >
      <svg width="108" height="32" viewBox="0 0 108 32" fill="none">
        <rect x="0.5" y="0.5" width="107" height="31" rx="5.5" fill={scrolled ? "#1A1512" : "#000"} stroke={scrolled ? "rgba(26,21,18,0.15)" : "#000"} />
        <path d="M14.2 10.8c.7-.9 1.8-1.5 2.9-1.5.1 1.2-.3 2.3-1 3.1-.7.8-1.8 1.5-2.9 1.4-.1-1.1.4-2.3 1-3zm-1 1.7c-1.7.1-3.2 1-4 2.5-1.7 3-.5 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.8 0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.9-1.5-.1-2.9.8-3.6.8-.7 0-1.9-.8-3.4-.8z" fill="#fff" />
        <text x="34" y="13" fontFamily="Inter,-apple-system,sans-serif" fontSize="7" fill="#fff" opacity="0.7">Download on the</text>
        <text x="34" y="23" fontFamily="Inter,-apple-system,sans-serif" fontSize="12" fontWeight="600" fill="#fff">App Store</text>
      </svg>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
        style={{ background:"#1A1512" }}>
        Coming Soon
      </div>
    </div>
  );
}

function PlayStoreBadge({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="relative group cursor-not-allowed select-none"
      style={{ opacity: scrolled ? 0.65 : 0.7 }}
      aria-label="Google Play — Coming Soon"
    >
      <svg width="108" height="32" viewBox="0 0 108 32" fill="none">
        <rect x="0.5" y="0.5" width="107" height="31" rx="5.5" fill={scrolled ? "#1A1512" : "#000"} stroke={scrolled ? "rgba(26,21,18,0.15)" : "#000"} />
        <path d="M9 8.5l9.5 7.5-9.5 7.5V8.5z" fill="#fff" opacity="0.5" />
        <path d="M9 8.5l5.5 5.5-5.5 5.5V8.5z" fill="#4FC3F7" />
        <path d="M9 8.5l9.5 7.5-3 1.9L9 8.5z" fill="#F48FB1" />
        <path d="M9 23.5l9.5-7.5-3-1.9L9 23.5z" fill="#A5D6A7" />
        <path d="M18.5 16l3.5 2.2-3.5 2.2V16z" fill="#FFF176" />
        <text x="28" y="13" fontFamily="Inter,-apple-system,sans-serif" fontSize="7" fill="#fff" opacity="0.7">GET IT ON</text>
        <text x="28" y="23" fontFamily="Inter,-apple-system,sans-serif" fontSize="11" fontWeight="600" fill="#fff">Google Play</text>
      </svg>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
        style={{ background:"#1A1512" }}>
        Coming Soon
      </div>
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = mobileOpen || pricingOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, pricingOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    // On pages without a video hero, always use the solid state
    if (pathname !== "/") {
      setScrolled(true);
      return;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // check initial position
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const scrollToModules = () => {
    setMobileOpen(false);
    if (pathname !== "/") { window.location.href = "/#modules"; return; }
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWaitlist = () => {
    setMobileOpen(false);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  const isAboutActive    = pathname === "/";
  const isFeaturesActive = pathname === "/features";

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={scrolled ? "nav-scrolled" : ""}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          background: scrolled ? "rgba(253,252,249,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(26,21,18,0.08)" : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 0 rgba(26,21,18,0.04)" : "none",
        }}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">

          {/* Logo — image from public folder */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 z-10">
            <div style={{
              width: 28, height: 28,
              borderRadius: 8,
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: scrolled ? "rgba(26,21,18,0.06)" : "rgba(255,255,255,0.15)",
              border: scrolled ? "1px solid rgba(26,21,18,0.1)" : "1px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}>
              <Image
                src="/logo.jpeg"
                alt="FitVerse logo"
                width={28}
                height={28}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span style={{
              fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em",
              color: scrolled ? "#1A1512" : "white",
              transition: "color 0.3s ease",
            }}>
              FitVerse
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-[40px]">
            <button onClick={scrollToModules} className={`nav-link ${isAboutActive ? "nav-link-active" : ""}`}
              style={scrolled ? { color: "#6B6560" } : {}}>Platform</button>
            <Link href="/features" className={`nav-link ${isFeaturesActive ? "nav-link-active" : ""}`}
              style={scrolled ? { color: "#6B6560" } : {}}>Features</Link>
            <button onClick={() => setPricingOpen(true)} className="nav-link"
              style={scrolled ? { color: "#6B6560" } : {}}>Pricing</button>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3 ml-auto z-10">
            <div className="flex items-center gap-2">
              <AppStoreBadge scrolled={scrolled} />
              <PlayStoreBadge scrolled={scrolled} />
            </div>
            <motion.button
              onClick={scrollToWaitlist}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                marginLeft: 4,
                padding: "10px 22px",
                borderRadius: "100px",
                fontSize: 14, fontWeight: 600,
                fontFamily: "Inter,sans-serif",
                cursor: "pointer",
                transition: "all 0.3s ease",
                ...(scrolled
                  ? { background: "#1A1512", color: "white", border: "none" }
                  : {
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      color: "white",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }
                ),
              }}
            >
              Join Waitlist
            </motion.button>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 flex flex-col gap-1.5 z-10"
            aria-label="Open menu"
          >
            {[0, 1, 2].map((i) => (
              <span key={i}
                className={`block h-0.5 rounded-full ${i === 2 ? "w-3.5" : "w-5"}`}
                style={{ background: scrolled ? "#1A1512" : "white", transition: "background 0.3s" }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ background: "#FDFCF9" }}
          >
            <div className="px-6 h-16 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(26,21,18,0.08)" }}>
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden",
                  border: "1px solid rgba(26,21,18,0.1)", flexShrink: 0,
                }}>
                  <Image src="/logo.jpeg" alt="FitVerse" width={28} height={28}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <span style={{ fontSize:17, fontWeight:600, color:"#1A1512" }}>FitVerse</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2" style={{ color:"#A39E98" }} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-8 flex flex-col gap-6">
              <button onClick={scrollToModules}
                className="text-left text-[18px] font-medium transition-colors"
                style={{ color:"#6B6560" }}>Platform</button>
              <Link href="/features" onClick={() => setMobileOpen(false)}
                className="text-[18px] font-medium transition-colors"
                style={{ color:"#6B6560" }}>Features</Link>
              <button onClick={() => { setMobileOpen(false); setPricingOpen(true); }}
                className="text-left text-[18px] font-medium transition-colors"
                style={{ color:"#6B6560" }}>Pricing</button>
              <div className="pt-4" style={{ borderTop:"1px solid rgba(26,21,18,0.08)" }}>
                <motion.button
                  onClick={scrollToWaitlist}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-full text-[15px] font-semibold"
                  style={{ background:"#1A1512", color:"white" }}
                >
                  Join Waitlist
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pricingOpen && (
          <PricingModal
            onClose={() => setPricingOpen(false)}
            onJoinWaitlist={() => { setPricingOpen(false); scrollToWaitlist(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
