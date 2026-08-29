"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { springSheet, springSnappy } from "@/lib/motion";
import Button from "@/components/ui/Button";

/* ── Nav control spec ─────────────────────────────────────────────────────────
   One height and one radius for every control in the bar. Previously the row
   carried five different corner radii and no two controls shared a height, so
   the cluster read as five unrelated things sitting next to each other.     */
/* Store badges sit below the CTA in the hierarchy, so they are deliberately
   shorter than its 44px: the primary stays the tallest thing in the cluster.
   The fixed width makes the pair genuinely identical rather than letting
   "Google Play" run wider than "App Store". */
const NAV_BADGE_H = 40;
const NAV_BADGE_W = 134;
const NAV_PILL = 999;

/* The drawer's nav rows: a ghost button that reads at reading size and aligns
   left. DRAWER_LINK_BASE supplies the box for the one row that stays a
   next/link rather than a Button, so the three rows stay identical. */
const DRAWER_LINK = {
  justifyContent: "flex-start" as const,
  fontSize: 19,
  fontWeight: 500,
  letterSpacing: "-0.015em",
  paddingLeft: 12,
  paddingRight: 12,
  color: "#1A1512",
};
const DRAWER_LINK_BASE = {
  display: "flex" as const,
  alignItems: "center" as const,
  height: 52,
  width: "100%",
  borderRadius: NAV_PILL,
  textDecoration: "none" as const,
};

/* ── Focus containment ────────────────────────────────────────────────────────
   Overlays must not leak focus to the page behind them, and must hand focus
   back to whatever opened them on close. Without this a keyboard user tabs
   straight out of a modal and is stranded with no way to dismiss it.        */
function useFocusTrap(active: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    restoreTo.current = document.activeElement as HTMLElement;

    const node = ref.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreTo.current?.focus();
    };
  }, [active, onClose]);

  return ref;
}

/* ── Pricing ──────────────────────────────────────────────────────────────── */
function PricingModal({
  onClose,
  originX,
}: {
  onClose: () => void;
  originX: number;
}) {
  const reduced = useReducedMotion();
  const panelRef = useFocusTrap(true, onClose);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      {/* Dim to focus: a modal task pushes the background back rather than
          sitting alongside it. */}
      <button
        aria-label="Close pricing"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "var(--scrim)", backdropFilter: "blur(4px)", border: "none" }}
        tabIndex={-1}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-title"
        /* Anchored origin: the sheet grows from the control that opened it,
           so the spatial relationship stays obvious. */
        style={{
          transformOrigin: `${originX}px top`,
          background: "#141110",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12, filter: "blur(6px)" }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12, filter: "blur(6px)" }}
        transition={reduced ? { duration: 0.18 } : springSheet}
        className="relative rounded-2xl w-full max-w-sm max-h-[88svh] overflow-y-auto"
      >
        <Button
          onClick={onClose}
          variant="icon"
          size="sm"
          ground="dark"
          className="absolute top-4 right-4 z-10"
          aria-label="Close pricing"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </Button>

        {/* Two lines and a lot of air. The glowing dot, accent eyebrow,
            hairline rule and fine print that used to live here were all
            decoration around a message that is one sentence long. */}
        <div
          className="flex flex-col items-center text-center"
          style={{ padding: "clamp(64px, 11vh, 88px) clamp(32px, 7vw, 56px)" }}
        >
          <h2
            id="pricing-title"
            style={{
              fontSize: 26, fontWeight: 600,
              color: "#FDFCF9", letterSpacing: "-0.02em", lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Coming soon
          </h2>
          <p style={{ fontSize: 15, color: "rgba(253,252,249,0.55)", lineHeight: 1.6 }}>
            Pricing will be announced at launch.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Store badges ─────────────────────────────────────────────────────────────
   Official-style black store badges — Apple mark with "Download on the App
   Store", Play mark with "Get it on Google Play" — with the availability
   status in a tooltip rather than a chip crammed inside the button.

   The tooltip is the part worth being careful about. An earlier revision of
   this component used a hover-only tooltip and it was replaced precisely
   because hover reaches neither keyboard nor touch. So it opens on hover,
   focus AND tap, and the status additionally lives in the accessible name —
   a screen reader is told "coming soon" whether or not the tooltip is up.

   aria-disabled rather than disabled: a genuinely disabled button is removed
   from the tab order, which would put the tooltip back out of keyboard reach. */
function StoreBadge({ store, scrolled }: { store: "apple" | "google"; scrolled: boolean }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const label = store === "apple" ? "App Store" : "Google Play";

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        /* Not `disabled`: that would drop it out of the tab order and put the
           tooltip beyond keyboard reach again. */
        aria-disabled="true"
        aria-label={`${label} — coming soon`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center"
        style={{
          width: NAV_BADGE_W,
          height: NAV_BADGE_H,
          gap: 8,
          paddingInline: 12,
          /* Official-badge geometry: black rounded rectangle, white marks,
             two-line lockup. Black in both scroll states — the badge is an
             artifact with its own ground, not a themed control. */
          borderRadius: 9,
          background: "#000",
          border: `1px solid ${scrolled ? "rgba(26,21,18,0.35)" : "rgba(255,255,255,0.32)"}`,
          cursor: "default",
          transition: "border-color 0.3s ease",
        }}
      >
        {store === "apple" ? (
          /* Apple mark */
          <svg width="17" height="20" viewBox="0 0 384 512" fill="#fff" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.7-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
        ) : (
          /* Google Play mark */
          <svg width="17" height="19" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5Z" fill="#00A0FF" />
            <path d="M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z" fill="#00E076" />
            <path d="M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81Z" fill="#FFCE00" />
            <path d="M6.05,21.34L14.54,12.85L16.81,15.12L6.05,21.34Z" fill="#FF3A44" />
          </svg>
        )}
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
          {store === "apple" ? (
            <span style={{ fontSize: 8.5, fontWeight: 500, lineHeight: 1, color: "rgba(255,255,255,0.9)", letterSpacing: "0.01em" }}>
              Download on the
            </span>
          ) : (
            <span style={{ fontSize: 8, fontWeight: 500, lineHeight: 1, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Get it on
            </span>
          )}
          <span style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.15, color: "#fff", letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>
            {label}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            aria-hidden="true"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
            transition={reduced ? { duration: 0.18 } : springSnappy}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "50%",
              translateX: "-50%",
              padding: "5px 10px",
              borderRadius: 8,
              background: "#1A1512",
              color: "#FDFCF9",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(26,21,18,0.22)",
              zIndex: 60,
            }}
          >
            Coming soon
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const reduced = useReducedMotion();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [originX, setOriginX] = useState(0);
  const pathname = usePathname();

  const closeDrawer = useCallback(() => setMobileOpen(false), []);
  const drawerRef = useFocusTrap(mobileOpen, closeDrawer);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || pricingOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, pricingOpen]);

  useEffect(() => {
    if (pathname !== "/") { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /* "About" always lands on the top hero. Previously this deep-linked to
     /#modules, which dropped returning visitors into the middle of the pinned
     horizontal-scroll section instead of the top of the page. */
  const scrollToHome = () => {
    setMobileOpen(false);
    if (pathname !== "/") { window.location.href = "/"; return; }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const scrollToWaitlist = () => {
    setMobileOpen(false);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  const openPricing = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOriginX(e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth / 2);
    setMobileOpen(false);
    setPricingOpen(true);
  };

  const isFeaturesActive = pathname === "/features";

  return (
    <>
      {/* Skip link — the first thing a keyboard user reaches on every page */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:px-4 focus:py-2 focus:rounded-full"
        style={{ background: "#1A1512", color: "#FDFCF9", fontSize: 14, fontWeight: 600 }}
      >
        Skip to content
      </a>

      <motion.nav
        initial={{ y: reduced ? 0 : -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springSnappy}
        className={scrolled ? "nav-scrolled mat-thin" : ""}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          transition: "background 0.3s ease, border-color 0.3s ease",
          background: scrolled ? undefined : "transparent",
          borderBottom: scrolled ? undefined : "1px solid transparent",
        }}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-8 h-[72px] flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 z-10 rounded-lg">
            <span style={{
              width: 28, height: 28, borderRadius: 8, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: scrolled ? "rgba(26,21,18,0.06)" : "rgba(255,255,255,0.15)",
              border: `1px solid ${scrolled ? "rgba(26,21,18,0.1)" : "rgba(255,255,255,0.3)"}`,
              flexShrink: 0,
            }}>
              <Image src="/logo.jpeg" alt="" width={28} height={28} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <span style={{
              fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em",
              color: scrolled ? "#1A1512" : "white", transition: "color 0.3s ease",
            }}>
              FitVerse
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-12">
            <button onClick={scrollToHome} className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>
              About
            </button>
            <Link href="/features" className={`nav-link ${isFeaturesActive ? "nav-link-active" : ""}`}>
              Features
            </Link>
            <button onClick={openPricing} className="nav-link" aria-haspopup="dialog" aria-expanded={pricingOpen}>
              Pricing
            </button>
          </div>

          <div className="hidden md:flex items-center ml-auto z-10" style={{ gap: 20 }}>
            {/* Badges are xl-only: between md and xl the absolutely-centred
                nav links and this right cluster physically overlap. Below xl
                the badges live in the drawer instead. */}
            <div className="hidden xl:flex items-center gap-2">
              <StoreBadge store="apple" scrolled={scrolled} />
              <StoreBadge store="google" scrolled={scrolled} />
            </div>
            {/* The only filled control in the cluster, and the tallest: solid in
                both scroll states, 44px against the badges' 40px. Nothing else
                here competes for the eye. */}
            <Button
              onClick={scrollToWaitlist}
              size="md"
              variant="primary"
              ground={scrolled ? "light" : "dark"}
            >
              Join waitlist
            </Button>
          </div>

          {/* Same pill footprint as the desktop controls, and a real surface to
              press: it previously had no hover or press feedback at all. */}
          {/* The wrapper owns the breakpoint, not the button. Button sets
              display:inline-flex as an inline style, which outranks the
              class rule md:hidden relies on — so hiding it from the button
              itself silently failed and it rendered at every width, next to
              the nav links it is supposed to replace. */}
          <div className="md:hidden z-10">
            <Button
              onClick={() => setMobileOpen(true)}
              variant="icon"
              size="md"
              ground={scrolled ? "light" : "dark"}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              style={{ flexDirection: "column", gap: 5 }}
            >
              {[0, 1, 2].map((i) => (
                <span key={i} className={`block h-0.5 rounded-full ${i === 2 ? "w-3.5" : "w-5"}`}
                  style={{ background: scrolled ? "#1A1512" : "white", transition: "background 0.3s" }} />
              ))}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer — enters from the right, where the hamburger lives, and
          leaves along the same path. In one way, out the same way. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={reduced ? { duration: 0.18 } : springSheet}
            className="fixed inset-0 z-[100]"
            style={{ background: "#FDFCF9" }}
          >
            <div className="px-6 h-16 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <Link href="/" onClick={closeDrawer} className="flex items-center gap-2.5">
                <span style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(26,21,18,0.1)", flexShrink: 0 }}>
                  <Image src="/logo.jpeg" alt="" width={28} height={28} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
                <span style={{ fontSize: 17, fontWeight: 600, color: "#1A1512", letterSpacing: "-0.02em" }}>FitVerse</span>
              </Link>
              <Button onClick={closeDrawer} variant="icon" size="sm" aria-label="Close menu"
                style={{ color: "#57514B" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </Button>
            </div>
            <div className="px-6 py-8 flex flex-col gap-1">
              {/* Ghost variant: left-aligned and larger than the default, but
                  the same fill, radius and press behaviour as every other
                  button. The Features row stays a next/link so in-app
                  navigation is still client-side. */}
              <Button onClick={scrollToHome} variant="ghost" size="lg" fullWidth style={DRAWER_LINK}>
                About
              </Button>
              <Link href="/features" onClick={closeDrawer} style={{ ...DRAWER_LINK, ...DRAWER_LINK_BASE }}>
                Features
              </Link>
              <Button onClick={openPricing} variant="ghost" size="lg" fullWidth style={DRAWER_LINK}>
                Pricing
              </Button>
              <div className="pt-5 mt-3 flex flex-col gap-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                <div className="flex gap-2">
                  <StoreBadge store="apple" scrolled />
                  <StoreBadge store="google" scrolled />
                </div>
                <Button onClick={scrollToWaitlist} size="lg" fullWidth>
                  Join waitlist
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pricingOpen && (
          <PricingModal
            originX={originX}
            onClose={() => setPricingOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
