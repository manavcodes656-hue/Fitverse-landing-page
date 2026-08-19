# FitVerse Landing Page — UI/UX & SEO Audit

**Audit date:** 16 August 2026
**Auditor scope:** Full codebase review — `app/`, `components/`, `lib/`, `public/`, `fitverse/`, root config
**Stack audited:** Next.js 14.2.35 (App Router, TypeScript), Tailwind CSS 3.4, Framer Motion 12, Supabase, Resend
**Constraint honoured:** No source file was modified. No structural change is recommended anywhere in this document.

---

## Executive Summary

The site has a genuinely strong visual foundation — a coherent warm-neutral palette, confident typography scale, and two standout interactions (the horizontal-scroll module rail and the Before/After comparison slider) that already read as premium. The skeleton is sound and does not need rebuilding. However, the site is **not currently safe to ship as a production, pre-launch marketing page**, for three reasons that outrank everything else: (1) the Testimonials section presents **five fabricated user reviews with fabricated outcomes** for a product that has never been used by anyone, (2) the FAQ makes an **unqualified guarantee of fitness results** and a "free plan" claim that directly contradicts the pricing modal and the page's own structured data, and (3) the entire security-header and Content-Security-Policy block in `next.config.ts` **is never loaded by the build**, because Next.js 14 does not read `.ts` config files and a competing `next.config.mjs` exists.

Beyond those, the dominant themes are: unoptimised media (roughly 10 MB of raw PNG/MP4 shipped through plain `<img>`/`<video>` tags, which will define and ruin the LCP), a systematically incomplete accessibility layer (the two flagship interactions are mouse-only and invisible to keyboard and screen-reader users), and missing SEO infrastructure (no sitemap, no robots, no `metadataBase`, a broken OG image, duplicated canonical tags).

**Total findings: 142** — 58 High, 60 Medium, 24 Low, spread across 11 sections plus 6 cross-cutting global themes. Of these, **over 40 are copy, link, or metadata findings** that can be actioned in Phase 1 with zero visual or structural impact; the Phase 1 list below sequences 30 of them.

---

## Section-by-Section Findings

### 1. Global Head, Metadata & Structured Data (`app/layout.tsx`)

- **Current State:** A single `Metadata` export defines title, description, keywords, canonical, robots, OpenGraph and Twitter cards. A `MobileApplication` JSON-LD block is injected via `dangerouslySetInnerHTML`. `<head>` additionally hand-writes a canonical link and a robots meta tag. Two Google fonts are loaded (Outfit, Playfair Display).

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | G-01 | `openGraph.images` points to `/og-image.jpg` ([layout.tsx:40](app/layout.tsx#L40)) — **this file does not exist in `public/`**. Every social share, WhatsApp forward, and Slack unfurl renders blank. | High | SEO |
  | G-02 | `twitter.card` is `summary_large_image` ([layout.tsx:43](app/layout.tsx#L43)) but no `twitter.images` is set; it falls back to the missing OG image. Twitter/X will render a bare text card. | High | SEO |
  | G-03 | No `metadataBase` is set. Next.js cannot resolve the relative `/og-image.jpg` to an absolute URL and emits a build warning; some crawlers will drop the image entirely. | High | SEO |
  | G-04 | **Duplicate canonical tag.** `alternates.canonical` ([layout.tsx:29](app/layout.tsx#L29)) and a manual `<link rel="canonical">` ([layout.tsx:63](app/layout.tsx#L63)) both emit. Two canonicals on one page is a known crawler-confusion signal. | High | SEO |
  | G-05 | **Duplicate robots directive** — `metadata.robots` ([layout.tsx:31](app/layout.tsx#L31)) and a manual `<meta name="robots">` ([layout.tsx:64](app/layout.tsx#L64)). | Medium | SEO |
  | G-06 | JSON-LD declares `"price": "0"`, `"priceCurrency": "INR"` ([layout.tsx:75-79](app/layout.tsx#L75-L79)). The pricing modal's cheapest plan is **₹149/mo**, and there is no free tier. This is a structured-data/on-page mismatch — exactly the pattern Google's structured data guidelines treat as misleading markup. | High | SEO |
  | G-07 | JSON-LD `"operatingSystem": "iOS, Android"` and type `MobileApplication` assert a shipped app. The app is not published on either store. | High | Content |
  | G-08 | No `FAQPage` structured data despite a six-question FAQ section — a free rich-result opportunity being left on the table. | Medium | SEO |
  | G-09 | No `Organization` schema (no logo, no `sameAs` social profiles, no founding info) — weakens brand entity resolution and knowledge-panel eligibility. | Medium | SEO |
  | G-10 | Meta description ([layout.tsx:21](app/layout.tsx#L21)) has **no punctuation at all** — it reads as one 168-character run-on. Same pattern in the OG and Twitter descriptions ([layout.tsx:37](app/layout.tsx#L37), [layout.tsx:45](app/layout.tsx#L45)). Reads as machine-generated in SERPs. | High | Content |
  | G-11 | `keywords` array ([layout.tsx:22-27](app/layout.tsx#L22-L27)) is ignored by Google and has been for over a decade. Harmless but signals an unmaintained SEO setup. | Low | SEO |
  | G-12 | `lang="en"` — given the explicit India positioning (INR pricing, "Made in India", Indian food database), `en-IN` is the more accurate signal. | Low | SEO |
  | G-13 | **Playfair Display is loaded with 6 weights but used nowhere in the codebase** (verified: zero references outside `layout.tsx`). Outfit loads 7 weights. That is ~13 font files, roughly half of them dead weight. | Medium | Performance |
  | G-14 | No `apple-touch-icon`, no `manifest.json`, no `theme-color` variant for dark mode. `themeColor` is hardcoded `#ffffff` while the site's dominant surface is `#FDFCF9`. | Low | SEO |

- **Recommendation:** Produce and commit a real `og-image.jpg` (1200×630); set `metadataBase`; delete the two hand-written `<head>` tags and let the Metadata API own canonical + robots; correct the JSON-LD offer to match real pricing (or drop `offers` entirely until pricing is locked); add `FAQPage` and `Organization` schema; rewrite all three descriptions as properly punctuated sentences; drop Playfair or commit to using it.
- **Priority:** High
- **Type:** SEO / Content / Performance

---

### 2. Navigation (`components/Navbar.tsx`)

- **Current State:** Fixed nav with a transparent-over-video state that swaps to a blurred cream solid past 60px scroll. Three centre links (About, Features, Pricing), two non-functional store badges, a "Join Waitlist" CTA, and a full-screen mobile drawer. Pricing opens a modal.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | NAV-01 | **The "About" link is mislabelled.** It calls `scrollToModules()` ([Navbar.tsx:255](components/Navbar.tsx#L255)) which scrolls to `#modules` — the product-feature rail. There is no About content anywhere on the site. Users clicking "About" expect company/mission information and get feature panels. | High | Content |
  | NAV-02 | **Pricing modal has no dialog semantics.** No `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby` ([Navbar.tsx:43-50](components/Navbar.tsx#L43-L50)). Screen readers announce it as an unlabelled group. | High | Accessibility |
  | NAV-03 | **No Escape-key close and no focus trap** on the pricing modal or the mobile drawer. Keyboard users can tab out of the modal into the page behind it and become stranded; there is no way to dismiss without a mouse. Focus is never returned to the trigger on close. | High | Accessibility |
  | NAV-04 | Store badges are `<div>` elements carrying `aria-label` ([Navbar.tsx:125-128](components/Navbar.tsx#L125-L128), [Navbar.tsx:145-148](components/Navbar.tsx#L145-L148)). `aria-label` on a generic `div` with no role is **ignored by most screen readers** — the "Coming Soon" status is silently dropped for assistive tech. | High | Accessibility |
  | NAV-05 | The "Coming Soon" tooltip on both badges is `group-hover:opacity-100` only ([Navbar.tsx:135](components/Navbar.tsx#L135), [Navbar.tsx:159](components/Navbar.tsx#L159)) — **unreachable by keyboard and by every touch device**. Mobile users see two store badges that look tappable, do nothing, and never explain why. Directly against requirement #8. | High | Accessibility |
  | NAV-06 | Hamburger button has `aria-label="Open menu"` but no `aria-expanded` and no `aria-controls` ([Navbar.tsx:298-301](components/Navbar.tsx#L298-L301)). | Medium | Accessibility |
  | NAV-07 | Mobile drawer has no `role="dialog"` and does not move focus into itself on open ([Navbar.tsx:315-320](components/Navbar.tsx#L315-L320)). | Medium | Accessibility |
  | NAV-08 | **No skip-to-content link** anywhere in the app. Keyboard users tab through the full nav on every page load. | Medium | Accessibility |
  | NAV-09 | Pricing plan CTAs ("Start Monthly", "Start 6-Month Plan", "Start Yearly Plan" — [Navbar.tsx:100-110](components/Navbar.tsx#L100-L110)) are **buttons with no `onClick` handler**. They are visually prominent, look purchasable, and do nothing. For a pre-launch product this is both a dead end and a trust problem. | High | Content |
  | NAV-10 | `.nav-link` hover underline is driven by `:hover` only ([globals.css:109](app/globals.css#L109)); there is no `:focus-visible` equivalent for the underline, so keyboard users get the generic outline but lose the designed affordance. | Medium | Accessibility |
  | NAV-11 | Nav link colour in the un-scrolled state is `rgba(255,255,255,0.85)` over an uncontrolled video frame — contrast is not guaranteed and varies frame to frame. | Medium | Accessibility |
  | NAV-12 | Scroll listener sets state on every scroll event ([Navbar.tsx:180](components/Navbar.tsx#L180)) with no throttle; combined with `Modules`' own scroll listener and rAF loop, three independent scroll systems run simultaneously. | Low | Performance |

- **Recommendation:** Relabel "About" to match its destination (or point it at real About content — but note that creating an About section is a structural change and is explicitly out of scope, so relabelling is the in-scope fix). Convert store badges to `<button disabled>` or a labelled `<span role="img">` with a persistently visible "Coming soon" chip rather than a hover tooltip. Add dialog semantics, Escape handling, focus trap and focus return to both overlays. Add a skip link. Either wire the plan CTAs to the waitlist or relabel them as "Notify me at launch".
- **Priority:** High
- **Type:** Accessibility / Content

---

### 3. Hero (`components/Hero.tsx`)

- **Current State:** Full-viewport autoplaying muted video background with a two-layer gradient + vignette overlay, an `<h1>` reading only "FitVerse", a one-line tagline, one white pill CTA with a pulse ring, and a scroll indicator.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | HERO-01 | **The `<h1>` is the single word "FitVerse"** ([Hero.tsx:87](components/Hero.tsx#L87)). This is the most valuable SEO element on the highest-value page and it carries zero keyword or value signal. A visitor who lands here learns the brand name and nothing about what the product does. Requirement #3 confirmed. | High | SEO / Content |
  | HERO-02 | The tagline ("Your nutrition. Your workouts. Your sleep. One system." — [Hero.tsx:102-105](components/Hero.tsx#L102-L105)) is the only descriptive copy above the fold, and it is a feature list, not a value proposition. No mention of AI, no outcome, no differentiation, no audience. | High | Content |
  | HERO-03 | **No supporting description paragraph.** The hero goes headline → tagline → button with no room for the "what this actually is" sentence. Requirement #2 confirmed at its most visible point. | High | Content |
  | HERO-04 | `hero-video.mp4` is **1.6 MB, autoplaying, with no `poster`, no `preload` attribute, and no mobile/data-saver alternative** ([Hero.tsx:17-33](components/Hero.tsx#L17-L33)). It downloads in full on every visit including 3G mobile. Until it paints, users see an empty black box. | High | Performance |
  | HERO-05 | Requirement #4 asks for an 8K source. **Flagging a direct conflict:** an 8K master would be roughly 20–60× the current payload and would make LCP catastrophically worse on the Indian mobile networks this product targets — working directly against the SEO goal in `CONTEXT.md`. This needs a decision (see Open Questions). | High | Performance |
  | HERO-06 | `<video>` has no `aria-hidden="true"` and no `poster`. It is decorative but is exposed to the accessibility tree as an unlabelled media element. | Medium | Accessibility |
  | HERO-07 | **No `prefers-reduced-motion` handling** — the video loops forever, the pulse ring pulses forever, and the scroll chevron bounces forever. Verified: zero `prefers-reduced-motion` queries exist anywhere in the codebase. A vestibular-sensitive user has no escape. | High | Accessibility |
  | HERO-08 | The CTA is a `<button>` that scrolls to `#waitlist` ([Hero.tsx:122](components/Hero.tsx#L122)). It is not a link, so it cannot be opened in a new tab, shared, or right-clicked, and the destination is not announced. | Low | Accessibility |
  | HERO-09 | Hardcoded `fontFamily: "Inter,sans-serif"` ([Hero.tsx:133](components/Hero.tsx#L133)) — **Inter is never loaded by the app.** This silently falls back to the OS default sans, so the CTA renders in a different typeface than the rest of the page on most machines. | Medium | UI |
  | HERO-10 | `height: "100vh"` ([Hero.tsx:13](components/Hero.tsx#L13)) — on mobile Safari and Chrome Android, `100vh` includes the collapsing URL bar, so the CTA and scroll indicator are pushed under the browser chrome on first paint. `100dvh` is the correct unit. | Medium | Responsiveness |
  | HERO-11 | `letterSpacing: "-3px"` is a fixed pixel value on a `clamp(56px, 9vw, 96px)` fluid headline ([Hero.tsx:78-82](components/Hero.tsx#L78-L82)). At 56px the tracking is proportionally ~1.7× tighter than at 96px — letters visibly collide on small phones. Should be an `em` value. | Medium | UI |

- **Recommendation:** Replace the `<h1>` with a real positioning statement carrying the primary keyword, demote "FitVerse" to the logo/eyebrow, add a supporting description line, and add a poster frame + `preload="none"` + a static image fallback under a mobile breakpoint. Convert fixed letter-spacing to `em`. Add a global reduced-motion strategy (see Global Issues).
- **Priority:** High
- **Type:** Content / SEO / Performance / Accessibility

---

### 4. Feature Rail — Horizontal Scroll (`components/Modules.tsx`)

- **Current State:** A 500vh-tall section with a sticky viewport; a rAF lerp loop translates a 400vw flex track horizontally as the user scrolls vertically. Four panels (AI Coach, Nutrition, Workout, Sleep), each with a number, `<h2>`, subtitle, description, and a 4:3 image. Progress dots at the bottom.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | MOD-01 | **Images are raw `<img>` tags with `next/image` explicitly disabled** ([Modules.tsx:167-179](components/Modules.tsx#L167-L179)). The four PNGs total **8.1 MB** (`aicoach.png` 1.8 MB, `nutrition tracker.png` 2.6 MB, `workout log.png` 1.9 MB, `sleep monitor.png` 2.0 MB) and are served **completely unoptimised** — no WebP/AVIF, no responsive `srcset`, no resizing. This is the single largest performance defect on the site. | High | Performance |
  | MOD-02 | No `width`/`height` on those `<img>` tags → cumulative layout shift on every panel. | Medium | Performance |
  | MOD-03 | Filenames contain spaces (`/nutrition tracker.png`, `/workout log.png`, `/sleep monitor.png`). These work but produce percent-encoded URLs, are fragile across CDNs and deploy pipelines, and are a known source of cache-key bugs. | Medium | Performance |
  | MOD-04 | **The rail is entirely inaccessible by keyboard.** Progress is derived solely from `window.scrollY` ([Modules.tsx:68-77](components/Modules.tsx#L68-L77)); there are no focusable controls, the progress dots are non-interactive `<div>`s ([Modules.tsx:190-202](components/Modules.tsx#L190-L202)), and there is no arrow-key or tab-to-advance path. | High | Accessibility |
  | MOD-05 | Inactive panels are hidden with `opacity: 0` ([Modules.tsx:131](components/Modules.tsx#L131), [Modules.tsx:164](components/Modules.tsx#L164)) — they remain in the accessibility tree and in tab order. A screen reader announces all four panels at once, invisibly. | Medium | Accessibility |
  | MOD-06 | An **infinite `requestAnimationFrame` loop runs for the entire page lifetime** ([Modules.tsx:98-101](components/Modules.tsx#L98-L101)) — it never pauses when the section is off-screen and never checks `prefers-reduced-motion`. Constant main-thread work and battery drain. | High | Performance |
  | MOD-07 | `setActivePanel` is called on **every animation frame** ([Modules.tsx:96](components/Modules.tsx#L96)), triggering a React state comparison 60×/sec even when the value is unchanged. | Medium | Performance |
  | MOD-08 | Scroll-jacking: 500vh of scroll to traverse four panels. On mobile this is roughly five full screen-heights of scrolling with no visible progress affordance beyond four small dots, and no way to skip. High abandonment risk. | Medium | UI |
  | MOD-09 | The rail translates by `window.innerWidth` and never recalculates on resize or orientation change ([Modules.tsx:75](components/Modules.tsx#L75)) — rotating a phone mid-section desynchronises the track from the scroll position. | Medium | Responsiveness |
  | MOD-10 | **Four `<h2>` elements with only the product-module name as content** ("AI Coach", "Nutrition Tracker"…). Combined with the "FitVerse"-only `<h1>`, the page's entire heading outline carries almost no semantic keyword weight. | Medium | SEO |
  | MOD-11 | Stray whitespace inside the `<h2>` ([Modules.tsx:150](components/Modules.tsx#L150)) — `{panel.name}` and the closing tag are on the same line with trailing spaces. Cosmetic, but indicative of unreviewed markup. | Low | UI |
  | MOD-12 | Descriptions are two short fragments each (e.g. [Modules.tsx:24](components/Modules.tsx#L24)). Thin for both the reader and for crawlers. Requirement #2. | Medium | Content |
  | MOD-13 | **Unverifiable product claims:** "14M+ foods" ([Modules.tsx:24](components/Modules.tsx#L24)) and "5,000+ exercises" ([Modules.tsx:36](components/Modules.tsx#L36)) are stated as fact for an unlaunched product, and repeated in `FeaturesContent.tsx` and the pricing modal. These need internal substantiation before they ship. | High | Content |
  | MOD-14 | The number label `72px` is hardcoded ([Modules.tsx:136](components/Modules.tsx#L136)) rather than fluid, and it duplicates the `panel.number` that also appears nowhere else — no responsive treatment. | Low | UI |

- **Recommendation:** Convert to `next/image` with explicit dimensions and let Next serve AVIF/WebP (requirement #9's real fix is compression and format, not new photography — though asset relevance should also be reviewed). Rename files to remove spaces. Add keyboard controls and make the progress dots real buttons. Gate the rAF loop on an IntersectionObserver and on `prefers-reduced-motion`. Expand each description to 2–3 substantive sentences.
- **Priority:** High
- **Type:** Performance / Accessibility / Content

---

### 5. The Problem — Comparison Slider (`components/ComparisonSlider.tsx`)

- **Current State:** Full-viewport dark section. A draggable before/after card: the "before" side shows five scattered, tilted app tiles (Nutrition, Workout, Sleep, Meditation, Community) that converge and vanish as the slider moves; the "after" side reveals the FitVerse logo. Flanked by left/right supporting copy.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | CS-01 | **Requirement #5 clarification — there are no competitor logos here.** The five "before" tiles are generic *category* labels (Nutrition, Workout, Sleep, Meditation, Community) with abstract SVG icons ([ComparisonSlider.tsx:6-94](components/ComparisonSlider.tsx#L6-L94)), not branded competitor marks. The brief's "replace competitor logos with witty versions" premise does not match what is built. This needs a decision before any work happens (see Open Questions). | High | Content |
  | CS-02 | **The slider is completely inaccessible.** It is a `<div>` with mouse and touch handlers only ([ComparisonSlider.tsx:230-255](components/ComparisonSlider.tsx#L230-L255)) — no `tabIndex`, no `role="slider"`, no `aria-valuenow`/`valuemin`/`valuemax`, no arrow-key handling. A keyboard or screen-reader user cannot operate the section's only interaction and never sees the payoff. This is the clearest violation of requirement #8 on the site. | High | Accessibility |
  | CS-03 | The card is the section's core message-delivery device, and **the message only exists in the interaction**. Non-interacting users (a majority on mobile) see "BEFORE" and stop. There is no static fallback stating the point. | High | UI |
  | CS-04 | **Contrast failures.** Body copy at `rgba(255,255,255,0.4)` on `#0F0D0A` ([ComparisonSlider.tsx:214](components/ComparisonSlider.tsx#L214), [ComparisonSlider.tsx:490](components/ComparisonSlider.tsx#L490)) computes to **≈3.8:1** — fails WCAG AA (4.5:1) for body text. The "Drag to reveal" hint at `rgba(255,255,255,0.3)` ([ComparisonSlider.tsx:457](components/ComparisonSlider.tsx#L457)) computes to **≈2.6:1** — a severe fail on the one instruction that explains the interaction. | High | Accessibility |
  | CS-05 | Tile labels are `8px` ([ComparisonSlider.tsx:303](components/ComparisonSlider.tsx#L303)) and the BEFORE/AFTER badges are `9px` ([ComparisonSlider.tsx:331](components/ComparisonSlider.tsx#L331), [ComparisonSlider.tsx:401](components/ComparisonSlider.tsx#L401)). Below the ~11px practical legibility floor, and unreadable at arm's length on mobile. | Medium | UI |
  | CS-06 | `maxHeight: "100vh"` with `overflow: hidden` ([ComparisonSlider.tsx:125-133](components/ComparisonSlider.tsx#L125-L133)): on short landscape phones the stacked mobile layout (header + text + 380px card + text) exceeds the viewport and **is clipped with no way to scroll to it**. Content loss, not just crowding. | High | Responsiveness |
  | CS-07 | Hard-coded `<br />` line breaks in all four copy blocks ([ComparisonSlider.tsx:209](components/ComparisonSlider.tsx#L209), [217](components/ComparisonSlider.tsx#L217), [485](components/ComparisonSlider.tsx#L485), [493](components/ComparisonSlider.tsx#L493)) force awkward wraps at every breakpoint the author didn't test. | Medium | Responsiveness |
  | CS-08 | `onMouseLeave` ends the drag ([ComparisonSlider.tsx:114](components/ComparisonSlider.tsx#L114)) — dragging quickly and exiting the card aborts the gesture mid-motion, which feels broken. Pointer capture is the correct pattern. | Medium | UI |
  | CS-09 | Uses `<style jsx global>` ([ComparisonSlider.tsx:498](components/ComparisonSlider.tsx#L498)) for responsive rules while every other component uses Tailwind or inline styles — a third styling paradigm in one codebase, and it emits genuinely global CSS from a leaf component. | Medium | UI |
  | CS-10 | The section has **no `aria-label`** ([ComparisonSlider.tsx:121](components/ComparisonSlider.tsx#L121)), unlike every other section on the page. It is an unnamed landmark. | Low | Accessibility |
  | CS-11 | `<h4>` "FitVerse" ([ComparisonSlider.tsx:383-392](components/ComparisonSlider.tsx#L383-L392)) is decorative image-content inside a heading tag, and skips from the section `<h3>`s without an intervening level. | Low | SEO |
  | CS-12 | Section copy is four short fragments totalling ~40 words for a full-viewport section — the thinnest content-to-space ratio on the page. | Medium | Content |
  | CS-13 | `/logo.jpeg` is used as the brand mark ([ComparisonSlider.tsx:377](components/ComparisonSlider.tsx#L377) and [Navbar.tsx:237](components/Navbar.tsx#L237)). A JPEG logo cannot have a transparent background and will show compression artefacts at the edges — an SVG or transparent PNG is standard for a brand mark. | Medium | UI |

- **Recommendation:** Resolve the competitor-logo question first. Make the slider a real ARIA slider with keyboard support and a static text summary of the payoff for non-interacting users. Lift muted text to at least `rgba(255,255,255,0.62)` to clear 4.5:1. Raise micro-type to ≥11px. Replace `maxHeight: 100vh` clipping with natural height. Replace `<br />` with responsive wrapping.
- **Priority:** High
- **Type:** Accessibility / UI / Content

---

### 6. Pricing (`components/Navbar.tsx` — `PricingModal`, lines 9–120)

- **Current State:** Three plans in a modal — Monthly ₹299, 6 Months ₹199/mo (billed ₹1,194), Yearly ₹149/mo (billed ₹1,788), with feature lists, a "Most Popular" badge, and a 7-day free trial note.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | PRC-01 | **Direct contradiction with the FAQ.** [FAQ.tsx:9-11](components/FAQ.tsx#L9-L11) states FitVerse is "free to download" with core features "available on the free plan" and a "Pro" tier. The pricing modal has **no free tier and no plan called Pro** — the entry point is ₹299/mo. One of these is wrong and a prospective customer will find both. | High | Content |
  | PRC-02 | The JSON-LD offer says `price: "0"` (G-06) — a third, mutually inconsistent version of the pricing story. | High | SEO |
  | PRC-03 | **Arithmetic error in the yearly plan.** ₹149/mo × 12 = ₹1,788, which matches — but ₹1,788/year against the 6-month plan's ₹1,194 per 6 months (₹2,388/year) is a 25% discount, while the *displayed* monthly rates imply 149 vs 199 (also 25%). These reconcile, but the Monthly plan at ₹299 × 12 = ₹3,588 means the yearly plan is advertised as ₹149 while saving 50% — **the savings are never stated anywhere**, which is the single most persuasive fact in the table. | Medium | Content |
  | PRC-04 | **Pricing is buried in a modal.** It is reachable only from a nav item, is not linkable, not crawlable, not indexable, and produces no URL. For a product whose landing page must "support payment authentication flows", pricing being invisible to search engines is a significant commercial and SEO gap. *(Note: surfacing it as a page section would be a structural change and is out of scope — flagging for the team's decision.)* | High | SEO |
  | PRC-05 | Plan CTAs are dead buttons (NAV-09). "Start Monthly" on an unlaunched product with no checkout is a broken promise. | High | Content |
  | PRC-06 | "7-day free trial on all plans" ([Navbar.tsx:115](components/Navbar.tsx#L115)) is a binding commercial commitment stated with no supporting terms, and it is not mentioned in the Terms of Service. | Medium | Content |
  | PRC-07 | Feature lists reference "AI Coach (10 queries/day)" ([Navbar.tsx:18](components/Navbar.tsx#L18)) on the *Monthly* plan while the FAQ says unlimited AI is a "Pro" feature — a third inconsistency in the same story. | Medium | Content |
  | PRC-08 | `#A39E98` on `#FDFCF9` for billing text and the "Cancel anytime" line ([Navbar.tsx:56](components/Navbar.tsx#L56), [Navbar.tsx:89](components/Navbar.tsx#L89), [Navbar.tsx:114](components/Navbar.tsx#L114)) computes to **≈2.6:1** — fails AA. This is the design system's `--text-muted` token, so the failure is systemic wherever it appears on light surfaces. | High | Accessibility |
  | PRC-09 | No annual/monthly toggle and no "save X%" badges — the table is not comparison-friendly, and the 6-month tier's "Most Popular" claim is unsupported for a product with no customers. | Medium | Content |
  | PRC-10 | The check icon uses a ternary that returns `#C4956A` in both branches ([Navbar.tsx:94](components/Navbar.tsx#L94)) — dead code, and on the dark highlighted card the amber check on `#1A1512` is lower contrast than intended. | Low | UI |
  | PRC-11 | No GST/tax indication on INR pricing. For an India-targeted paid product this is a compliance-adjacent omission. | Medium | Content |
  | PRC-12 | The modal is not responsive below ~640px in a meaningful way — three cards stack to a `max-h-[90vh]` scroll container, pushing the third plan almost entirely below the fold with no scroll affordance. | Medium | Responsiveness |

- **Recommendation:** Lock a single source of truth for pricing and propagate it to the FAQ, the JSON-LD, and the plan feature lists. Add explicit savings percentages. Replace dead CTAs with waitlist actions. Add GST language. Fix `--text-muted` globally rather than per-instance.
- **Priority:** High
- **Type:** Content / SEO / Accessibility

---

### 7. FAQ (`components/FAQ.tsx`)

- **Current State:** Six accordion items tagged App/AI/Data/Goal, with a ghost number watermark, a rotating plus icon, and staggered reveal.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | FAQ-01 | **"Will FitVerse guarantee I hit my fitness goals?" → "Yes."** ([FAQ.tsx:39-41](components/FAQ.tsx#L39-L41)). An unqualified guarantee of health and body-composition outcomes. This is a material misrepresentation risk under Indian consumer protection law and the ASCI code, it contradicts the site's own Terms of Service, and no fitness product can substantiate it. **This is the highest-severity content finding on the site.** | High | Content |
  | FAQ-02 | **"Is FitVerse free to download?" → "Yes… available on the free plan"** ([FAQ.tsx:9-11](components/FAQ.tsx#L9-L11)) contradicts the pricing modal (PRC-01) and asserts iOS/Android availability for an app that is on neither store. | High | Content |
  | FAQ-03 | "Is my health data safe with FitVerse?" → **"Completely."** ([FAQ.tsx:33-35](components/FAQ.tsx#L33-L35)). An absolute security guarantee, directly contradicted by the site's own Privacy Policy which correctly states "no method of transmission over the Internet is 100% secure" ([app/privacy/page.tsx:57](app/privacy/page.tsx#L57)). | High | Content |
  | FAQ-04 | The FAQ describes infrastructure ("row-level security on our database") to consumers. Wrong register — this is engineering detail, not a user-facing trust signal. | Low | Content |
  | FAQ-05 | **The accordion is a `<div onClick>`** ([FAQ.tsx:59-61](components/FAQ.tsx#L59-L61)) — no `tabIndex`, no `role="button"`, no `aria-expanded`, no `aria-controls`, no Enter/Space handling. **Six primary content items are entirely unreachable by keyboard.** Requirement #8, most severe instance. | High | Accessibility |
  | FAQ-06 | The `faq.tag` field ("App", "AI", "Data", "Goal") is defined on every item but **never rendered anywhere**. Dead data, and a missed filtering/scannability feature. | Low | Content |
  | FAQ-07 | Only six questions, and the set omits everything a pre-launch visitor actually asks: what devices/wearables sync, whether data exports, how to cancel, whether it works offline, refund policy, what happens to waitlist data. Requirement #6 confirmed. | High | Content |
  | FAQ-08 | No `FAQPage` structured data (G-08) — this section is the site's best rich-result candidate and it is unmarked. | Medium | SEO |
  | FAQ-09 | Answer text is `#6B7280` on `#F5F0E8` ([FAQ.tsx:163](components/FAQ.tsx#L163)) — passes AA, but the open-question colour `#C4956A` on `#F5F0E8` ([FAQ.tsx:106](components/FAQ.tsx#L106)) computes to roughly **2.6:1** and fails. The active state is less readable than the inactive one. | High | Accessibility |
  | FAQ-10 | The 80px ghost number ([FAQ.tsx:71-89](components/FAQ.tsx#L71-L89)) is positioned `right: 0` and sits underneath the 40px icon circle at mobile widths, creating visual collision. | Medium | Responsiveness |
  | FAQ-11 | Hardcoded `fontFamily: "Inter,sans-serif"` on every text node in this file (lines 78, 103, 161, 222, 235, 249) — Inter is not loaded (HERO-09). This entire section renders in a fallback typeface. | Medium | UI |
  | FAQ-12 | Section intro is one line, "Everything you want to know about FitVerse." ([FAQ.tsx:256](components/FAQ.tsx#L256)) — generic filler. | Low | Content |

- **Recommendation:** Rewrite FAQ-01 and FAQ-03 to remove absolute guarantees; reconcile FAQ-02 with real pricing; expand to 10–12 questions covering pre-launch concerns; convert accordion headers to real `<button>` elements with `aria-expanded`; add FAQPage schema; render or remove the `tag` field.
- **Priority:** High
- **Type:** Content / Accessibility / SEO

---

### 8. Reviews / Testimonials (`components/Testimonials.tsx`)

- **Current State:** An infinite auto-scrolling marquee of five testimonial cards (duplicated to ten for the loop), each with 5 gold stars, a quote, initials avatar, name and Indian city.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | REV-01 | **All five testimonials are fabricated, and they fabricate specific outcomes for a product that has never been used by a single person.** "Been using it for 6 weeks" ([Testimonials.tsx:10](components/Testimonials.tsx#L10)), "Lost 5kg in 2 months" ([Testimonials.tsx:42](components/Testimonials.tsx#L42)), "The AI coach noticed I was overtraining before I did" ([Testimonials.tsx:26](components/Testimonials.tsx#L26)). Combined with named individuals, cities, and uniform 5-star ratings, these are invented endorsements. **This is the single most serious issue in the audit** — it is a misrepresentation exposure under the Consumer Protection Act 2019 and the ASCI code, and it is unrecoverable reputational damage if noticed at launch. It must not ship in any form. Requirements #7 and #11 confirmed. | High | Content |
  | REV-02 | The section heading is **"Real results. Real people."** ([Testimonials.tsx:114](components/Testimonials.tsx#L114)) — the copy explicitly asserts authenticity for content that is invented. This compounds REV-01 rather than softening it. | High | Content |
  | REV-03 | The eyebrow "What people are saying" ([Testimonials.tsx:102](components/Testimonials.tsx#L102)) makes the same assertion. | High | Content |
  | REV-04 | Hardcoded 5-star ratings on every card ([Testimonials.tsx:51-61](components/Testimonials.tsx#L51-L61)) with no rating data model — there is no integration point for Google Reviews, Play Store, or App Store as required by #7. Any future sync will require this component to be re-architected around a data source. | High | Content |
  | REV-05 | The array is duplicated (`[...testimonials, ...testimonials]` — [Testimonials.tsx:49](components/Testimonials.tsx#L49)) for the marquee loop. Screen readers announce **ten testimonials**, five of them verbatim repeats, with no `aria-hidden` on the duplicate set. | Medium | Accessibility |
  | REV-06 | **The marquee never pauses** — no pause on hover, no pause on focus, no `prefers-reduced-motion` guard ([Testimonials.tsx:129-133](components/Testimonials.tsx#L129-L133)). WCAG 2.2.2 requires a mechanism to pause any auto-moving content that runs more than 5 seconds. This is a direct, citable failure. | High | Accessibility |
  | REV-07 | Cards have `whileHover`/`whileTap` scale animations and `cursor-default` ([Testimonials.tsx:138-141](components/Testimonials.tsx#L138-L141)) — they respond to interaction but are not interactive and not focusable. Misleading affordance. | Medium | Accessibility |
  | REV-08 | Location text `#9CA3AF` on white ([Testimonials.tsx:162](components/Testimonials.tsx#L162)) computes to **≈2.8:1** — fails AA. | Medium | Accessibility |
  | REV-09 | The section has no supporting description beneath the heading — heading straight into the marquee. Requirement #2. | Medium | Content |
  | REV-10 | 40-second linear infinite animation on a `translateX` of a `max-content` flex row containing ten cards — continuous compositor work for the life of the page. | Low | Performance |

- **Recommendation:** Remove all five fabricated testimonials before anything else in this audit is actioned. For pre-launch, replace with an honest treatment that fits the existing card layout without structural change — e.g. waitlist momentum, founder/product principles, or an explicit "Reviews arrive when our users do" placeholder. Build the card around a rating/source data shape now so the Google/Play/App Store sync in #7 becomes a data swap rather than a rebuild. Add pause-on-hover/focus and a reduced-motion guard.
- **Priority:** High (blocking)
- **Type:** Content / Accessibility

---

### 9. Waitlist & Footer (`components/Footer.tsx`)

- **Current State:** A dark waitlist block with name/email inputs and a submit button (posting to `/api/waitlist`), then a four-column footer (Brand + socials, Product, Company, Legal) and a bottom bar.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | FTR-01 | **Company links Blog, Careers, Press all point to `href="#"`** ([Footer.tsx:71-73](components/Footer.tsx#L71-L73)) — three dead links with no content behind them. Requirement #1 confirmed exactly as described. | High | Content |
  | FTR-02 | **The "About" company link points to `#about`** ([Footer.tsx:70](components/Footer.tsx#L70)) — **no element with `id="about"` exists anywhere in the codebase** (verified: only `#waitlist` and `#modules` exist). This is a fourth broken link, and it is the one that looks most legitimate. | High | Content |
  | FTR-03 | **All three social icons point to `href="#"`** ([Footer.tsx:213](components/Footer.tsx#L213)) — Instagram, Twitter/X and LinkedIn all go nowhere. They carry correct `aria-label`s, so a screen-reader user is told "Instagram, link" and lands on the same page. | High | Content |
  | FTR-04 | **Form inputs have no `<label>`** ([Footer.tsx:134-151](components/Footer.tsx#L134-L151)) — placeholder-only labelling. Placeholders disappear on focus and are not reliable accessible names. Two required fields on the site's only conversion mechanism. | High | Accessibility |
  | FTR-05 | Success, duplicate, and error messages ([Footer.tsx:119-182](components/Footer.tsx#L119-L182)) are **not in an `aria-live` region**. A screen-reader user submits the form and receives no confirmation that anything happened. | High | Accessibility |
  | FTR-06 | Link hover colour is applied by mutating inline style in `onMouseEnter`/`onMouseLeave` ([Footer.tsx:238-239](components/Footer.tsx#L238-L239), and identically at lines 257-258, 276-277, 294-295, 300-301). **This produces no focus state** — keyboard users get the global outline but the designed colour change never fires. It also bypasses CSS entirely, so the behaviour cannot be overridden by a stylesheet or a media query. Requirement #8. | High | Accessibility |
  | FTR-07 | The `motion.a` social links use `whileHover` for background change ([Footer.tsx:215](components/Footer.tsx#L215)) with no `whileFocus` equivalent. | Medium | Accessibility |
  | FTR-08 | Copyright year is **hardcoded `© 2026`** ([Footer.tsx:290](components/Footer.tsx#L290)). Correct today, silently wrong from 1 January 2027. Requirement #14. | Medium | Content |
  | FTR-09 | Bottom-bar text and links at `rgba(255,255,255,0.4)` on `#0F0D0A` ([Footer.tsx:289](components/Footer.tsx#L289), [293](components/Footer.tsx#L293), [299](components/Footer.tsx#L299)) compute to **≈3.8:1** — fails AA. | High | Accessibility |
  | FTR-10 | Privacy Policy and Terms are duplicated — once in the Legal column ([Footer.tsx:77-78](components/Footer.tsx#L77-L78)) and again in the bottom bar ([Footer.tsx:293-304](components/Footer.tsx#L293-L304)). Redundant, and it dilutes the Cookie Policy link. | Low | UI |
  | FTR-11 | The brand tagline "One App. Every Dimension of Fit." ([Footer.tsx:201](components/Footer.tsx#L201)) is the strongest brand line on the site and appears **only in the footer** — it is absent from the hero, where it would do real work. | Medium | Content |
  | FTR-12 | The footer logo is an inline SVG ([Footer.tsx:194-196](components/Footer.tsx#L194-L196)) while the navbar uses `/logo.jpeg` — **two different brand marks on the same page**. | Medium | UI |
  | FTR-13 | No contact email or support route anywhere in the footer, despite `privacy@fitverse.app` and `legal@fitverse.app` existing in the legal pages. A missing contact path is a recognised E-E-A-T weakness for commercial sites. | Medium | SEO |
  | FTR-14 | The waitlist heading "Be first when we launch." is an `<h2>` inside `<footer>` ([Footer.tsx:112](components/Footer.tsx#L112)) — the primary conversion point sits in the `contentinfo` landmark rather than in `main`. | Low | SEO |
  | FTR-15 | Submit button has no `aria-busy` during the loading state, and the spinner SVG has no accessible name ([Footer.tsx:163-165](components/Footer.tsx#L163-L165)). | Low | Accessibility |
  | FTR-16 | No privacy/consent microcopy next to the email field. The site collects personal data and hashes IPs (documented in the Privacy Policy) but the form itself never links to that policy at the point of collection. | Medium | Content |

- **Recommendation:** Replace Blog/Careers/Press with real destinations or a non-link "Coming soon" treatment within the existing column. Fix or remove the `#about` link. Point socials at real profiles or remove them. Add visually-hidden `<label>`s and an `aria-live="polite"` status region. Move hover colour from inline JS handlers into CSS classes so `:focus-visible` inherits it. Make the year dynamic. Add a contact link and consent microcopy.
- **Priority:** High
- **Type:** Content / Accessibility

---

### 10. Features Page (`app/features/page.tsx`, `components/FeaturesContent.tsx`)

- **Current State:** Five stacked full-height feature sections (the four home modules plus Community), each with a number watermark, heading, tagline, description, five-item checklist and an image; a hero band and a dark CTA strip.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | FEA-01 | **The Community image is a remote Unsplash stock photo** ([FeaturesContent.tsx:86](components/FeaturesContent.tsx#L86)) — a generic gym photo, loaded from a third-party CDN, sitting among four real product screenshots. It is visually and tonally inconsistent, it is the clearest instance of requirement #9, and it makes the product's fifth module look unbuilt. | High | UI / Content |
  | FEA-02 | That Unsplash dependency also forces a `remotePatterns` entry in the Next config and an `images.unsplash.com` allowance in the CSP `img-src` — an external runtime dependency and an attack-surface widening for one decorative photo. | Medium | Performance |
  | FEA-03 | **`<Navbar />` and `<Footer />` are rendered inside `<main>`** ([app/features/page.tsx:14-18](app/features/page.tsx#L14-L18)). This nests the `navigation` and `contentinfo` landmarks inside `main`, which is a landmark-structure violation and confuses screen-reader landmark navigation. The same mistake exists in `LegalLayout.tsx`. The home page does it correctly — so this is an inconsistency, not a pattern. | Medium | Accessibility |
  | FEA-04 | Same raw `<img>` / no-optimisation problem as the module rail ([FeaturesContent.tsx:175-187](components/FeaturesContent.tsx#L175-L187)) — the same 8.1 MB of PNGs, loaded a second time on this route. | High | Performance |
  | FEA-05 | Feature descriptions here are **near-duplicates of the home-page module descriptions** (compare [FeaturesContent.tsx:12-13](components/FeaturesContent.tsx#L12-L13) with [Modules.tsx:11-12](components/Modules.tsx#L11-L12)). Duplicate content across two indexed URLs, and a missed chance to go deeper on the page that exists specifically to go deeper. | High | SEO / Content |
  | FEA-06 | The page metadata has **no canonical, no OpenGraph, and no Twitter card** ([app/features/page.tsx:6-10](app/features/page.tsx#L6-L10)) — it inherits nothing useful and shares as a bare link. | Medium | SEO |
  | FEA-07 | The `<h1>` "Five modules. One system." ([FeaturesContent.tsx:215-222](components/FeaturesContent.tsx#L215-L222)) is better than the home page's, but still carries no primary keyword. | Medium | SEO |
  | FEA-08 | Five `minHeight: 80vh` sections plus a hero and CTA strip = a very long page with a uniform rhythm and no pacing variation; the checklists are the only content differentiator. | Low | UI |
  | FEA-09 | Zero `aria-*` attributes in the entire component (verified count: 0), and none of the five `<section>` elements has an accessible name. | Medium | Accessibility |
  | FEA-10 | Community module features ("Accountability partner matching", "Expert-led group programs" — [FeaturesContent.tsx:89-95](components/FeaturesContent.tsx#L89-L95)) describe capabilities not mentioned anywhere else on the site and not represented in the home rail. Unverified scope claims. | Medium | Content |
  | FEA-11 | The CTA strip's supporting copy uses `text-[#6B7280]` on `#0A0A0A` ([FeaturesContent.tsx:251](components/FeaturesContent.tsx#L251)) — a mid-grey intended for light backgrounds, used on near-black. Computes to roughly **3.5:1**, fails AA. | Medium | Accessibility |
  | FEA-12 | The CTA strip background is `#0A0A0A` while the site's dark token is `#0F0D0A` ([FeaturesContent.tsx:237](components/FeaturesContent.tsx#L237)) — an off-token colour, visibly cooler than the warm dark used everywhere else. | Low | UI |

- **Recommendation:** Replace the Unsplash photo with a real Community screenshot or an on-brand illustration, and remove the remote-image dependency from config and CSP once it is gone. Move `Navbar`/`Footer` outside `<main>`. Differentiate this page's copy substantially from the home rail. Add full per-page metadata.
- **Priority:** High
- **Type:** UI / Content / SEO

---

### 11. Legal Pages (`app/privacy`, `app/terms`, `app/cookies`, `components/LegalLayout.tsx`)

- **Current State:** Three well-written, genuinely substantive legal documents rendered through a shared `LegalLayout` with dedicated `.legal-content` typography. Contact addresses are `privacy@fitverse.app` and `legal@fitverse.app`.

- **Issues Found:**

  | ID | Issue | Priority | Type |
  |---|---|---|---|
  | LEG-01 | **All three pages read "Last updated: January 1, 2025"** ([privacy:11](app/privacy/page.tsx#L11), [terms:11](app/terms/page.tsx#L11), [cookies:11](app/cookies/page.tsx#L11)) — over 19 months stale as of this audit, on a product that has not launched. Undermines the trust these documents exist to build. | High | Content |
  | LEG-02 | The Terms correctly state the Service is "currently in pre-launch phase" ([terms:29](app/terms/page.tsx#L29)) — **this honest framing is contradicted by the FAQ, the testimonials, the store badges and the JSON-LD.** The legal pages are the only part of the site telling the truth about launch status. | High | Content |
  | LEG-03 | The Privacy Policy correctly states no method of transmission is 100% secure ([privacy:57](app/privacy/page.tsx#L57)), directly contradicting the FAQ's "Completely." (FAQ-03). | High | Content |
  | LEG-04 | `LegalLayout` renders `<Navbar />` and `<Footer />` inside `<main>` ([LegalLayout.tsx:12-29](components/LegalLayout.tsx#L12-L29)) — same landmark violation as FEA-03. | Medium | Accessibility |
  | LEG-05 | Legal pages have no canonical, OG, or Twitter metadata; only title and description. | Low | SEO |
  | LEG-06 | The Cookie Policy documents a Supabase auth cookie and analytics categories — **but no cookie consent banner exists anywhere in the codebase.** For a stated India/EU-facing product collecting personal data, documenting cookies you never obtain consent for is a compliance gap. | High | Content |
  | LEG-07 | `LegalLayout` `<h1>` is a fixed `40px` ([LegalLayout.tsx:21](components/LegalLayout.tsx#L21)) with no fluid scaling — the only non-responsive `h1` on the site. | Low | Responsiveness |
  | LEG-08 | The Terms mention a 13-year minimum age ([terms:23](app/terms/page.tsx#L23)); India's DPDP Act sets 18 with verifiable parental consent below that. Worth legal review. | Medium | Content |
  | LEG-09 | No refund/cancellation policy exists in the Terms, despite the pricing modal offering paid subscriptions and a 7-day trial (PRC-06). | Medium | Content |

- **Recommendation:** Re-date all three documents on the next content pass. Treat the legal pages as the source of truth for launch status and reconcile the marketing copy to them, not the other way round. Add a cookie consent mechanism or remove the categories you do not actually set. Get LEG-08 and LEG-09 reviewed by counsel.
- **Priority:** High
- **Type:** Content

---

### 12. Sections Referenced in the Brief That Do Not Exist

Flagging explicitly rather than inventing findings for them:

| Section | Status |
|---|---|
| **About** | **Does not exist.** Both the nav ([Navbar.tsx:255](components/Navbar.tsx#L255)) and the footer ([Footer.tsx:70](components/Footer.tsx#L70)) link to it. The nav redirects to the module rail; the footer link is dead. No mission, team, founder, or company story content exists anywhere on the site. For a pre-launch product asking for payment details and personal data, the absence of any "who are we" content is a genuine trust gap. Adding a section would be a structural change and is out of scope — flagged for the team's decision. |
| **Results / Stats** | **Does not exist — and this is good.** No user counts, download numbers, "10,000+ members", or transformation statistics appear anywhere in the codebase (verified). Requirement #11 is satisfied for *statistics*. It is **not** satisfied for testimonials (REV-01), which fabricate individual outcomes instead. |
| **Blog / Careers / Press** | **Do not exist**, but are linked from the footer (FTR-01). |

---

## Global Issues

### G-A. Typography System — fragmented across four competing sources

**Priority: High · Type: UI**

The codebase defines type in four incompatible ways simultaneously:

1. `tailwind.config.ts` declares a complete, well-designed fluid scale (`display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `small`, `micro` — [tailwind.config.ts:42-51](tailwind.config.ts#L42-L51)). **It is never used by a single component.**
2. `globals.css` defines `--font-outfit` and `--font-inter` custom properties ([globals.css:9-10](app/globals.css#L9-L10)).
3. Components hardcode inline `fontSize`/`fontWeight`/`letterSpacing` values everywhere (`Hero`, `Modules`, `ComparisonSlider`, `FAQ`, `Navbar`, `Footer`).
4. `FeaturesContent.tsx` uses Tailwind arbitrary values (`text-[11px]`, `text-[#111827]`).

Concrete consequences:
- **`Inter` is referenced in `tailwind.config.ts`, in `globals.css` as `--font-inter`, and hardcoded as `fontFamily: "Inter,sans-serif"` in `Hero`, `ComparisonSlider` and `FAQ` — but Inter is never loaded.** Every one of those declarations falls through to the OS default sans. On Windows that is Segoe UI; on Android, Roboto. Large parts of the site render in a typeface nobody chose.
- **Playfair Display is loaded with six weights and used nowhere** (G-13).
- Two different grey scales coexist: the warm token set (`#1A1512`/`#6B6560`/`#A39E98`) and a cool Tailwind-default set (`#111827`/`#6B7280`/`#9CA3AF`), used interchangeably — sometimes in the same component.
- Fixed `letterSpacing` in pixels on fluid `clamp()` headings (HERO-11) breaks proportional tracking at small sizes.

**Recommendation:** Adopt the existing Tailwind scale as the single source of truth (it is already well-designed — it just needs to be used), load Inter or purge every reference to it, and consolidate to one grey ramp. This is a Phase 2 change, but the *decision* should be made in Phase 1 because copy length depends on it.

---

### G-B. Accessibility — systemic, not incidental

**Priority: High · Type: Accessibility**

`globals.css` does establish a sensible `:focus-visible` baseline ([globals.css:67](app/globals.css#L67)) — genuinely good, and it means the foundation is there. But it is undermined everywhere above it:

- **Three primary interactions are `<div onClick>` or `<div onMouseDown>`:** the FAQ accordion (FAQ-05), the comparison slider (CS-02), and the module rail's progress dots (MOD-04). None is focusable, none has a role, none responds to a key press. A keyboard-only user can reach the nav, the CTAs, the footer links and the form — and nothing else. Requirement #8 is not partially met; the site's three signature interactions are all inaccessible.
- **Hover-only information:** the "Coming Soon" store tooltips (NAV-05) and every footer link's hover colour (FTR-06) are invisible to keyboard and touch users.
- **Zero `prefers-reduced-motion` handling** across the entire codebase (verified: no matches). Running concurrently at all times: a looping video, an infinite pulse ring, an infinite bounce, two infinite nudge animations, a 40s infinite marquee, and a permanent `requestAnimationFrame` loop.
- **Contrast failures are token-level, not one-off.** `--text-muted` (`#A39E98`) fails on light surfaces at ≈2.6:1, and `rgba(255,255,255,0.4)` fails on dark surfaces at ≈3.8:1. Both are used repeatedly across `ComparisonSlider`, `Footer`, `Navbar` and the pricing modal. *(Ratios computed from the composited values; recommend confirming with an automated checker during implementation.)*
- **No skip link**, and landmark nesting is wrong on `/features` and all legal pages (FEA-03, LEG-04).
- **The waitlist form** — the site's only conversion point — has no labels and no live region (FTR-04, FTR-05).

---

### G-C. Performance — the media payload will define the LCP

**Priority: High · Type: Performance**

| Asset | Size | Delivery |
|---|---|---|
| `nutrition tracker.png` | 2.6 MB | raw `<img>`, no optimisation |
| `workout log.png` | 1.9 MB | raw `<img>`, no optimisation |
| `sleep monitor.png` | 2.0 MB | raw `<img>`, no optimisation |
| `aicoach.png` | 1.8 MB | raw `<img>`, eager-loaded |
| `hero-video.mp4` | 1.6 MB | autoplay, no poster, no preload hint |
| **Total** | **≈9.9 MB** | |

Every one of the four PNGs is loaded through a plain `<img>` with `next/image` **explicitly disabled via an eslint-disable comment** ([Modules.tsx:167](components/Modules.tsx#L167), [FeaturesContent.tsx:175](components/FeaturesContent.tsx#L175), [ComparisonSlider.tsx:375](components/ComparisonSlider.tsx#L375)) — so there is no AVIF/WebP conversion, no responsive `srcset`, no resizing, and no width/height to prevent layout shift. `aicoach.png` is `loading="eager"` and will almost certainly be the LCP element at 1.8 MB.

Compounding factors: 13 font files for two families (one unused), a permanent rAF loop (MOD-06), three independent scroll listeners, and a 40-second infinite compositor animation.

For a product targeting Indian mobile users, this profile — roughly 10 MB before fonts and JS — is the difference between a good and a failing Core Web Vitals assessment, which directly undermines the SEO goal stated in `CONTEXT.md`. **Requirement #4's 8K video ask makes this materially worse and needs a decision before implementation.**

---

### G-D. Build Configuration — the security headers never ship *(verified)*

**Priority: High · Type: Performance / Security**

Both `next.config.ts` and `next.config.mjs` exist in the repo root.

`next.config.ts` contains the full security posture — CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` ([next.config.ts:13-37](next.config.ts#L13-L37)).
`next.config.mjs` contains only the Unsplash `remotePatterns` entry and **no headers at all**.

I verified against the installed Next.js source — `node_modules/next/dist/shared/lib/constants.js` defines:

```js
const CONFIG_FILES = [
    "next.config.js",
    "next.config.mjs"
];
```

TypeScript config support landed in Next.js 15; this project is on **14.2.35** ([package.json:14](package.json#L14)). **`next.config.ts` is never read.** The build silently uses `next.config.mjs`, so every security header and the entire Content-Security-Policy is dead code that has never been applied to a single response.

**Recommendation:** Merge the `.ts` config into `next.config.mjs` (or upgrade Next and delete the `.mjs`). Verify with `curl -I` against a production build before launch. This is a small change with a large blast radius, and it should be treated as a Phase 1 infrastructure fix independent of the content/UI phases.

---

### G-E. SEO Infrastructure — missing files

**Priority: High · Type: SEO**

- **No `app/sitemap.ts` and no `public/sitemap.xml`** (verified absent). Five indexable routes exist (`/`, `/features`, `/privacy`, `/terms`, `/cookies`) and none is declared.
- **No `app/robots.ts` and no `public/robots.txt`** (verified absent). There is no crawl directive and no sitemap pointer.
- No `manifest.json`, no `apple-touch-icon` (G-14).
- The OG image referenced in metadata does not exist (G-01).
- No per-page canonical/OG on `/features` or the legal routes (FEA-06, LEG-05).

---

### G-F. Repository Hygiene

**Priority: Low–Medium · Type: Performance**

| ID | Issue | Priority |
|---|---|---|
| HYG-01 | `README.md` is **unmodified `create-next-app` boilerplate** — it still describes deploying a starter template and references the Geist font, which this project does not use. | Low |
| HYG-02 | `app/fonts/GeistVF.woff` and `app/fonts/GeistMonoVF.woff` are leftover starter assets, **not referenced anywhere**. | Low |
| HYG-03 | A stray nested directory `fitverse/app/privacy/email-templates.ts` sits inside the project root and is imported by the waitlist route as `@/fitverse/app/privacy/email-templates` ([app/api/waitlist/route.ts:5](app/api/waitlist/route.ts#L5)). An email template living under a `privacy` path inside a duplicated `app` tree is a structural accident that will confuse anyone new to the repo. | Medium |
| HYG-04 | `.gitignore` ignores `.env*.local` but **not bare `.env`** — given `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are in play, a `.env` file could be committed. | Medium |
| HYG-05 | `lib/resend.ts` falls back to the literal string `"re_placeholder"` when the API key is missing ([lib/resend.ts:9](lib/resend.ts#L9)) — this means a misconfigured production deploy fails silently at send time rather than at boot. | Medium |
| HYG-06 | Waitlist rate limiting is an **in-memory `Map`** ([app/api/waitlist/route.ts:8](app/api/waitlist/route.ts#L8)). On Vercel's serverless runtime each invocation may get a fresh instance, so the 3-per-hour limit is not reliably enforced. | Medium |
| HYG-07 | Git history is two commits, both named "Initial commit". No branching or review trail ahead of a team-review workflow. | Low |

---

## Recommended Fix Order

### Phase 1 — Content-only changes (no visual or structural impact)

Ordered by severity. Every item below changes strings, links, or metadata only — no layout, no component structure, no styling.

**Blocking (do not ship without these):**

1. **REV-01/02/03** — Remove all five fabricated testimonials and the "Real results. Real people." / "What people are saying" framing. Replace with honest pre-launch content in the same card layout.
2. **FAQ-01** — Remove the unqualified "Yes" guarantee of fitness results.
3. **FAQ-03** — Remove the absolute "Completely." data-safety claim.
4. **FAQ-02 / PRC-01 / PRC-07 / G-06** — Lock one pricing story and propagate it to the FAQ, the plan feature lists, and the JSON-LD offer.
5. **G-04 / G-05** — Remove the duplicated canonical and robots tags from `<head>`.
6. **G-D** — Merge `next.config.ts` into `next.config.mjs` so the CSP and security headers actually ship. *(Infrastructure, not content — but it is small, isolated, and should not wait for Phase 2.)*

**High priority content:**

7. **FTR-01 / FTR-02** — Remove or replace Blog, Careers, Press and the dead `#about` link.
8. **FTR-03** — Real social URLs, or remove the icons.
9. **NAV-01** — Relabel the "About" nav item to match where it goes.
10. **NAV-09 / PRC-05** — Replace the three dead pricing CTAs with waitlist actions or "Notify me at launch".
11. **HERO-01 / HERO-02 / HERO-03** — New `<h1>`, new tagline, new supporting description. (Requirement #3.)
12. **G-10** — Rewrite the meta, OG and Twitter descriptions with actual punctuation.
13. **G-01 / G-02 / G-03** — Create the OG image, set `metadataBase`, add the Twitter image.
14. **FAQ-07** — Expand the FAQ from 6 to 10–12 questions covering pre-launch concerns. (Requirement #6.)
15. **LEG-01** — Re-date all three legal documents.
16. **G-07** — Correct the JSON-LD so it does not assert a shipped iOS/Android app.
17. **MOD-13** — Substantiate or soften the "14M+ foods" and "5,000+ exercises" claims.
18. **FEA-05** — Differentiate the `/features` copy from the home rail to remove duplicate content.

**Medium priority content:**

19. **MOD-12** — Expand the four module descriptions. (Requirement #2.)
20. **CS-12** — Expand the Problem section copy. (Requirement #2.)
21. **REV-09** — Add a description under the Reviews heading.
22. **FTR-08** — Make the copyright year dynamic. (Requirement #14.)
23. **FTR-11** — Promote "One App. Every Dimension of Fit." out of the footer.
24. **FTR-13 / FTR-16** — Add a contact route and consent microcopy at the point of data collection.
25. **PRC-03 / PRC-09 / PRC-11** — Add savings percentages and GST language; reconsider the unsupported "Most Popular" badge.
26. **G-08 / G-09** — Add `FAQPage` and `Organization` structured data.
27. **G-E** — Add `app/sitemap.ts` and `app/robots.ts`.
28. **LEG-06 / LEG-08 / LEG-09** — Cookie consent, minimum age, refund policy (needs counsel).
29. **FAQ-06** — Render or remove the unused `tag` field.
30. **G-12** — `lang="en-IN"`.

### Phase 2 — UI / visual enhancement (post content approval)

**Accessibility (highest priority in this phase — requirement #8):**

1. **FAQ-05** — Accordion headers → real `<button>` with `aria-expanded`/`aria-controls`.
2. **CS-02** — Comparison slider → `role="slider"` with full keyboard support and ARIA value state.
3. **MOD-04 / MOD-05** — Keyboard controls for the module rail; progress dots → buttons; hide inactive panels from the a11y tree.
4. **NAV-02 / NAV-03 / NAV-07** — Dialog semantics, focus trap, Escape handling and focus return for the pricing modal and mobile drawer.
5. **NAV-04 / NAV-05** — Store badges → semantic elements with a persistently visible "Coming soon" state.
6. **FTR-04 / FTR-05 / FTR-15** — Form labels, `aria-live` status region, `aria-busy`.
7. **FTR-06 / FTR-07 / NAV-10** — Move hover styling from inline JS into CSS so focus states inherit it.
8. **REV-06 / REV-07** — Pause the marquee on hover and focus.
9. **HERO-07 / G-B** — A global `prefers-reduced-motion` strategy covering the video, marquee, pulse ring, bounce, nudges and the rAF loop.
10. **CS-04 / PRC-08 / FTR-09 / FAQ-09 / REV-08 / FEA-11** — Fix contrast at the token level, not per instance.
11. **NAV-08** — Skip-to-content link.
12. **FEA-03 / LEG-04** — Move `Navbar`/`Footer` outside `<main>`.

**Performance:**

13. **MOD-01 / MOD-02 / FEA-04** — Convert all images to `next/image`, compress, and set explicit dimensions. Single highest-impact change on the site.
14. **MOD-03** — Rename asset files to remove spaces.
15. **HERO-04 / HERO-05** — Poster frame, `preload` strategy, mobile fallback; resolve the 8K question first.
16. **MOD-06 / MOD-07** — Gate the rAF loop on visibility and reduced-motion; stop the per-frame state write.
17. **G-13** — Remove Playfair or use it.
18. **FEA-01 / FEA-02** — Replace the Unsplash Community photo; then remove the remote-image config and CSP allowance. (Requirement #9.)

**Visual polish:**

19. **G-A** — Consolidate typography onto the existing Tailwind scale; load Inter or purge it; unify the two grey ramps.
20. **HERO-11** — Fluid letter-spacing in `em`.
21. **HERO-10** — `100dvh` for the hero.
22. **CS-05 / CS-06 / CS-07** — Micro-type ≥11px, remove viewport clipping, remove hardcoded `<br />`.
23. **CS-13 / FTR-12** — One brand mark, in SVG.
24. **CS-01** — The Problem section's visual treatment, once the competitor-logo question is resolved. (Requirement #5.)
25. **MOD-08 / MOD-09** — Scroll-rail length and resize handling.
26. **PRC-12 / FAQ-10** — Mobile layout fixes for the pricing modal and the FAQ ghost numbers.
27. **CS-09** — Retire `<style jsx global>` in favour of the project's normal styling approach.
28. **HYG-01 → HYG-07** — Repository hygiene.

---

## Open Questions / Needs Clarification

1. **Requirement #5 — the competitor-logo premise does not match the build.** The Problem section contains five *generic category* tiles (Nutrition, Workout, Sleep, Meditation, Community), not competitor brand marks. Three options: (a) keep generic categories and improve the visual treatment; (b) introduce real competitor logos — **note this carries trademark risk and comparative-advertising exposure under the ASCI code, and it is the reason most products avoid it**; (c) create witty fictional app parodies as the brief suggests. Which direction?

2. **Requirement #4 — 8K hero video conflicts with the SEO goal.** An 8K master is roughly 20–60× the current 1.6 MB payload and would badly damage LCP on Indian mobile networks. Options: (a) source an 8K master but ship a 1080p/1440p optimised derivative with a poster frame — visually identical on virtually every real display, since almost no visitor has an 8K screen; (b) ship 4K for desktop with a mobile fallback; (c) ship true 8K and accept the Core Web Vitals cost. I recommend (a). Which?

3. **Requirement #7 — reviews cannot be real yet.** No product, no users, no store listings, so no Google/Play/App Store data exists to sync. What should occupy the Reviews section at launch: waitlist momentum, founder/product principles, an explicit "Reviews arrive when our users do" placeholder, or should the section render nothing until real reviews exist? *(Whatever is chosen, the fabricated testimonials must come out regardless.)*

4. **Which pricing story is correct?** Three mutually exclusive versions ship today: FAQ says free-with-Pro-upgrade, the modal says ₹299/₹199/₹149 with no free tier, and the structured data says ₹0. Is there a free tier or not?

5. **Is there a launch date or window** we can commit to in the FAQ? The current answer ("Join the waitlist now") avoids the question visitors most want answered.

6. **Real social profiles** — do Instagram, Twitter/X and LinkedIn accounts exist? If not, should the icons be removed for now rather than linking to `#`?

7. **The "About" gap.** Nav and footer both promise About content that does not exist. Relabelling is the in-scope fix; adding a real About section would be a structural change. Does the team want to authorise that as an exception, or should we relabel?

8. **The pricing modal is invisible to search engines** (PRC-04). Pricing is a top-three commercial keyword cluster for any subscription product. Surfacing it as a page section would breach the skeleton constraint — does the team want to authorise an exception, or accept that pricing stays unindexed?

9. **Does the `/features` route need to stay indexable** given its copy substantially duplicates the home page rail (FEA-05)? Either differentiate it or canonicalise it.

10. **Cookie consent** (LEG-06) — the Cookie Policy documents analytics and preference cookies, but no consent mechanism exists. Is a banner planned before launch?

11. **`CONTEXT.md` mentions payment authentication and user onboarding.** Neither exists in the codebase today. Are these in scope for this enhancement pass, or a later phase? They would materially affect the pricing CTAs (NAV-09).

12. **The UI reference repo and v3.1 design** referenced in `CONTEXT.md` have not been provided. Phase 2 planning is blocked on them.

---

*Audit complete. No source files were modified. `AUDIT.md` is ready for team review.*
