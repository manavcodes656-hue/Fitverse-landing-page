"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setFormState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (res.status === 409 || data.error === "duplicate") setFormState("duplicate");
      else if (res.ok && data.success) setFormState("success");
      else setFormState("error");
    } catch {
      setFormState("error");
    }
  };

  const productLinks = [
    { label: "Nutrition Tracker", href: "/features#nutrition" },
    { label: "Sleep Tracker", href: "/features#sleep" },
    { label: "AI Coach", href: "/features#ai-coach" },
    { label: "Community", href: "/features#community" },
    { label: "Wellness", href: "/features#wellness" },
    { label: "For Women", href: "/features#for-women" },
    { label: "Workout", href: "/features#workout" },
  ];

  // Blog / Careers / Press have no content behind them yet, so they are rendered
  // as plain text rather than links that go nowhere.
  const companyLinks: { label: string; href?: string }[] = [
    { label: "Platform", href: "/#modules" },
    { label: "Contact", href: "mailto:hello@fitverse.app" },
    { label: "Blog (coming soon)" },
    { label: "Careers (coming soon)" },
    { label: "Press (coming soon)" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const buttonVariants = {
    hover: {
      scale: 1.015,
      backgroundColor: "#C4956A",
      color: "#0F0D0A",
      y: -1,
      boxShadow: "0 0 28px rgba(196,149,106,0.35)",
    },
    tap: { scale: 0.985 },
  };

  return (
    <footer
      id="waitlist"
      className="text-white"
      style={{ backgroundColor: "#0F0D0A" }}
      role="contentinfo"
    >
      {/* Waitlist section */}
      <div ref={sectionRef} className="border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl flex flex-col items-center justify-center text-center"
          >
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-4 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              Get early access
            </p>
            <h2 className="text-white font-bold text-center mb-2" style={{ fontSize: "40px", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Be first when we launch.
            </h2>
            <p className="text-[15px] font-light text-center mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              Your launch invite and the occasional build update. No spam, no
              noise, unsubscribe anytime. See our{" "}
              <Link href="/privacy" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>
                Privacy Policy
              </Link>
              .
            </p>

            {formState === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 py-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-white text-[16px] font-medium">You&apos;re in. See you at launch.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-row gap-3 justify-center items-center flex-wrap w-full">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={formState === "loading"}
                  className="placeholder-white/35 focus:border-white/50 focus:bg-white/[0.09] disabled:opacity-50 outline-none w-[220px] h-[52px] bg-white/[0.06] border border-white/[0.15] rounded-[14px] px-5 text-[15px] font-normal text-white transition-all duration-200"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={formState === "loading"}
                  className="placeholder-white/35 focus:border-white/50 focus:bg-white/[0.09] disabled:opacity-50 outline-none w-[220px] h-[52px] bg-white/[0.06] border border-white/[0.15] rounded-[14px] px-5 text-[15px] font-normal text-white transition-all duration-200"
                />
                <motion.button
                  type="submit"
                  disabled={formState === "loading"}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex-shrink-0 bg-white text-[#0a0a0a] font-semibold disabled:opacity-60 whitespace-nowrap flex items-center justify-center gap-2 h-[52px] px-8 rounded-[14px] border-none cursor-pointer transition-all"
                >
                  {formState === "loading" ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" />
                      </svg>
                      Joining...
                    </>
                  ) : "Join Waitlist"}
                </motion.button>
              </form>
            )}

            {formState === "duplicate" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[13px] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                You&apos;re already on the list. We&apos;ll see you at launch.
              </motion.p>
            )}
            {formState === "error" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[13px] text-center text-red-400">
                Something went wrong. Try again.
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer body */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1" style={{ opacity: 0.9 }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h2.5M10.5 8H13M8 3v2.5M8 10.5V13M5.5 5.5l1.5 1.5M9 9l1.5 1.5M9 5.5L7.5 7M5.5 10.5L7 9" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[17px] font-semibold tracking-tight text-white">FitVerse</span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-[200px]" style={{ color: "rgba(255,255,255,0.65)" }}>
              An AI fitness system built in India. Currently in pre-launch.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5 mt-6">
              {[
                { label: "Instagram", color: "#E1306C", Icon: InstagramIcon },
                { label: "Twitter / X", color: "transparent", Icon: TwitterIcon },
                { label: "LinkedIn", color: "#0A66C2", Icon: LinkedInIcon },
              ].map(({ label, color, Icon }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  whileHover={{ scale: 1.015, backgroundColor: "rgba(255,255,255,0.15)" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: color === "transparent" ? "rgba(255,255,255,0.08)" : color,
                    border: color === "transparent" ? "1px solid rgba(255,255,255,0.12)" : "none",
                  }}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Product
            </p>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-150" style={{ color: "rgba(255,255,255,0.65)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Company
            </p>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link href={link.href} className="text-[14px] transition-colors duration-150" style={{ color: "rgba(255,255,255,0.65)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Legal
            </p>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] transition-colors duration-150" style={{ color: "rgba(255,255,255,0.65)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            © FitVerse · Since 2026 · Made in India 🇮🇳
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[13px] transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[13px] transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
