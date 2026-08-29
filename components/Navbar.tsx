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
const NAV_BADGE_H = 36;
const NAV_BADGE_W = 128;
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
  onJoinWaitlist,
  originX,
}: {
  onClose: () => void;
  onJoinWaitlist: () => void;
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
        style={{ transformOrigin: `${originX}px top` }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12, filter: "blur(6px)" }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12, filter: "blur(6px)" }}
        transition={reduced ? { duration: 0.18 } : springSheet}
        className="relative rounded-3xl w-full max-w-lg max-h-[88svh] overflow-y-auto mat-thick"
      >
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6560", marginBottom: 6 }}>
                Pricing
              </p>
              <h2 id="pricing-title" style={{ fontSize: 28, fontWeight: 700, color: "#1A1512", letterSpacing: "-0.025em" }}>
                Pricing coming soon.
              </h2>
            </div>
            <Button
              onClick={onClose}
              variant="icon"
              size="sm"
              className="flex-shrink-0"
              style={{ color: "#57514B" }}
              aria-label="Close pricing"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </Button>
          </div>
        </div>

        {/* No tiers, no numbers, no feature lists — pricing is announced at
            launch. The modal stays so the nav item still answers the question. */}
        <div className="px-8 py-10 flex flex-col items-center text-center">
          <p style={{ fontSize: 15, color: "#57514B", lineHeight: 1.65, maxWidth: "38ch", marginBottom: 24 }}>
            We&apos;re finalizing plans ahead of launch. Join the waitlist and
            you&apos;ll be the first to see them — waitlist members get launch
            pricing before anyone else.
          </p>
          <Button onClick={onJoinWaitlist} variant="primary" size="md">
            Join the waitlist
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Store badges ─────────────────────────────────────────────────────────────
   Outline buttons carrying the real store marks, with the availability status
   in a tooltip rather than a chip crammed inside the button.

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
  /* Store names as plain text plus a generic download glyph. The names are
     ordinary descriptive use; it is the official badge artwork that is
     licensed for linking to a live listing, and that goes in at launch. */
  const label = store === "apple" ? "App Store" : "Google Play";
  const ink = scrolled ? "#1A1512" : "#fff";

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
        className="inline-flex items-center justify-center"
        style={{
          width: NAV_BADGE_W,
          height: NAV_BADGE_H,
          gap: 7,
          /* Soft rectangle rather than the capsule the rest of the bar uses:
             these are a quieter class of control than the primary CTA. */
          borderRadius: 10,
          /* Outline, not fill. A filled badge here would compete directly with
             the filled primary sitting beside it. */
          background: "transparent",
          border: `1px solid ${scrolled ? "rgba(26,21,18,0.14)" : "rgba(255,255,255,0.28)"}`,
          cursor: "default",
          transition: "border-color 0.3s ease",
        }}
      >
        {/* Generic download glyph — arrow into a tray. Says "this is where you
            get the app" without borrowing either store's mark. */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M12 3v11m0 0l-4.2-4.2M12 14l4.2-4.2" stroke={ink} strokeWidth="1.9"
            strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 16.5v1.8A2.7 2.7 0 0 0 7.2 21h9.6a2.7 2.7 0 0 0 2.7-2.7v-1.8" stroke={ink}
            strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em", color: ink }}>
          {label}
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

  const scrollToModules = () => {
    setMobileOpen(false);
    if (pathname !== "/") { window.location.href = "/#modules"; return; }
    document.getElementById("modules")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
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
            <button onClick={scrollToModules} className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>
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
            <div className="flex items-center gap-2">
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
              <Button onClick={scrollToModules} variant="ghost" size="lg" fullWidth style={DRAWER_LINK}>
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
            onJoinWaitlist={() => { setPricingOpen(false); scrollToWaitlist(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
