"use client";

import { useState, useRef, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { reveal, springSnappy } from "@/lib/motion";
import Button from "@/components/ui/Button";

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

/* Hover and focus share one CSS rule, so a keyboard user gets the same
   affordance a mouse user does. Previously this lived in onMouseEnter /
   onMouseLeave handlers that mutated inline styles — which no focus event
   could ever trigger. */
const footerLink =
  "text-[14px] text-white/70 hover:text-white focus-visible:text-white transition-colors duration-150 rounded";

export default function Footer() {
  const reduced = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const nameId = useId();
  const emailId = useId();

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
      /* TEMP DEBUG — remove once the waitlist failure is diagnosed.
         Read the raw text first: if the route dies before it can serialise
         JSON, res.json() throws and the real body is lost. */
      const raw = await res.text();
      console.log("[waitlist] HTTP", res.status, res.statusText);
      console.log("[waitlist] raw body:", raw);

      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(raw);
        console.log("[waitlist] parsed body:", data);
      } catch {
        console.error("[waitlist] body was not JSON");
      }

      if (res.status === 409 || data.error === "duplicate") setFormState("duplicate");
      else if (res.ok && data.success) setFormState("success");
      else {
        console.error("[waitlist] FAILED — error:", data.error, "debug:", data.debug);
        setFormState("error");
      }
    } catch (err) {
      console.error("[waitlist] fetch/handler threw:", err);
      setFormState("error");
    }
  };

  const productLinks = [
    { label: "Nutrition Tracker", href: "/features#nutrition" },
    { label: "Sleep Tracker", href: "/features#sleep" },
    { label: "AI Coach", href: "/features#ai-coach" },
    { label: "Community", href: "/features#community" },
    { label: "Wellness", href: "/features#wellness" },
    { label: "Workout", href: "/features#workout" },
  ];

  const companyLinks: { label: string; href?: string }[] = [
    { label: "About", href: "/" },
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

  /* The field is a capsule to match the submit button sitting flush beside it.
     A 14px-radius input against a capsule button reads as two unrelated parts
     of one control. */
  const inputClass =
    "w-full sm:w-[220px] h-[52px] rounded-full px-6 text-[15px] font-normal text-white " +
    "bg-white/[0.07] border border-white/20 placeholder-white/45 " +
    "focus:border-white/60 focus:bg-white/[0.11] focus:outline-none " +
    "disabled:opacity-50 transition-all duration-200";

  return (
    <footer id="waitlist" className="text-white" style={{ backgroundColor: "#0F0D0A" }} role="contentinfo">
      {/* ── Waitlist ── */}
      <div ref={sectionRef} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={reveal}
            className="w-full max-w-2xl flex flex-col items-center justify-center text-center"
          >
            <p style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.62)", marginBottom: 16,
            }}>
              Get early access
            </p>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 700, color: "white",
              letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 12, textWrap: "balance",
            }}>
              Be first when we launch.
            </h2>
            <p style={{
              fontSize: "0.9375rem", color: "rgba(255,255,255,0.72)",
              lineHeight: 1.6, marginBottom: 32, maxWidth: "46ch",
            }}>
              Your launch invite and the occasional build update. No spam, no noise,
              unsubscribe anytime. See our{" "}
              <Link href="/privacy" className="text-white underline underline-offset-2 hover:text-white focus-visible:text-white">
                Privacy Policy
              </Link>.
            </p>

            {formState === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springSnappy}
                className="flex items-center justify-center gap-3 py-4"
              >
                <span className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-white text-[16px] font-medium">You&apos;re in. See you at launch.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-row gap-3 justify-center items-center flex-wrap w-full">
                {/* Placeholders are not labels: they vanish on focus and are not a
                    reliable accessible name. */}
                <label htmlFor={nameId} className="sr-only">Your name</label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={formState === "loading"}
                  className={inputClass}
                />

                <label htmlFor={emailId} className="sr-only">Email address</label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={formState === "loading"}
                  className={inputClass}
                />

                <Button
                  type="submit"
                  size="lg"
                  ground="dark"
                  disabled={formState === "loading"}
                  aria-busy={formState === "loading"}
                  className="flex-shrink-0"
                >
                  {formState === "loading" ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" />
                      </svg>
                      Joining…
                    </>
                  ) : "Join waitlist"}
                </Button>
              </form>
            )}

            {/* Status is announced, not just shown. Without a live region a
                screen-reader user submits the form and hears nothing back. */}
            <p role="status" aria-live="polite" className="mt-3 text-[13px] text-center min-h-[1.25rem]">
              {formState === "duplicate" && (
                <span style={{ color: "rgba(255,255,255,0.72)" }}>
                  You&apos;re already on the list. We&apos;ll see you at launch.
                </span>
              )}
              {formState === "error" && (
                <span style={{ color: "#FCA5A5" }}>Something went wrong. Try again.</span>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Footer body ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              {/* Same mark and same tile as the navbar. This was previously a
                  drawn starburst icon, so the site shipped two different
                  logos on one page. The footer sits on dark, so it takes the
                  navbar's over-dark treatment. */}
              <span style={{
                width: 28, height: 28, borderRadius: 8, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                flexShrink: 0,
              }}>
                <Image src="/logo.jpeg" alt="" width={28} height={28}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </span>
              <span className="text-[17px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>FitVerse</span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-[220px]" style={{ color: "rgba(255,255,255,0.72)" }}>
              An AI fitness system built in India. Currently in pre-launch.
            </p>

            <ul className="flex gap-2.5 mt-6 list-none p-0">
              {[
                { label: "Instagram", color: "#E1306C", Icon: InstagramIcon },
                { label: "X (Twitter)", color: "transparent", Icon: TwitterIcon },
                { label: "LinkedIn", color: "#0A66C2", Icon: LinkedInIcon },
              ].map(({ label, color, Icon }) => (
                <li key={label}>
                  {/* TODO: real profile URLs. Until they exist these are marked
                      unavailable rather than pointing at "#". */}
                  <span
                    aria-label={`${label} — coming soon`}
                    title="Coming soon"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80"
                    style={{
                      background: color === "transparent" ? "rgba(255,255,255,0.08)" : color,
                      border: color === "transparent" ? "1px solid rgba(255,255,255,0.14)" : "none",
                      opacity: 0.75,
                    }}
                  >
                    <Icon />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-product">
            <p id="footer-product" style={{
              fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.62)", marginBottom: 20,
            }}>
              Product
            </p>
            <ul className="space-y-3 list-none p-0">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <p id="footer-company" style={{
              fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.62)", marginBottom: 20,
            }}>
              Company
            </p>
            <ul className="space-y-3 list-none p-0">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link href={link.href} className={footerLink}>{link.label}</Link>
                  ) : (
                    <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>{link.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <p id="footer-legal" style={{
              fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.62)", marginBottom: 20,
            }}>
              Legal
            </p>
            <ul className="space-y-3 list-none p-0">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.09)" }}
        >
          {/* Was rgba(255,255,255,0.4) — roughly 3.8:1 on this ground, below the
              4.5:1 minimum. Lifted rather than restyled. */}
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.62)" }}>
            © FitVerse · Since 2026 · Made in India 🇮🇳
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[13px] text-white/62 hover:text-white focus-visible:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.62)" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[13px] hover:text-white focus-visible:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.62)" }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
