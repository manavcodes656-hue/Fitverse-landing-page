# FitVerse Landing Page — Launch Readiness

**Team brief · 16 August 2026**
Full technical detail: [`AUDIT.md`](AUDIT.md) · 142 findings with file and line references

---

## The verdict in one paragraph

The site looks good. The design foundation is genuinely strong — the palette, the type scale, the horizontal feature rail and the before/after slider all read as premium, and **none of it needs rebuilding**. What's not ready is the *content*. Three things on the site today are not true, and one security setting has never actually been switched on. Those four items are launch blockers. Everything else is improvement work, sequenced below.

**Can we ship today?** No.
**Do we need to rebuild?** No.
**How much is copy vs. code?** Over 40 of the findings are pure copy, links, or settings — no design work required.

---

## Status by section

| Section | Status | Headline issue |
|---|---|---|
| Reviews / Testimonials | **BLOCKER** | All five reviews are invented |
| FAQ | **BLOCKER** | Guarantees fitness results; contradicts our pricing |
| Security headers | **BLOCKER** | Written, but never actually applied to the live site |
| Pricing | **BLOCKER** | Three contradictory versions ship at once |
| Footer | Needs work | Four dead links, including one that looks real |
| Hero | Needs work | Headline is just the word "FitVerse" |
| Images & video | Needs work | ~10 MB per visit — will hurt Google ranking |
| Legal pages | Needs work | Dated Jan 2025; no cookie consent |
| Feature rail | Needs work | Unusable by keyboard; heavy images |
| Problem / comparison | Needs work | Unusable by keyboard; text too faint to read |
| Navigation | Needs work | "About" goes to the wrong place |
| Features page | Needs work | One stock photo among four real screenshots |

---

## The four blockers

### 1. Every review on the site is made up

Five testimonials with real-sounding names, cities, and specific claims — *"Lost 5kg in 2 months"*, *"Been using it for 6 weeks"* — sit under a heading that reads **"Real results. Real people."**

Nobody has ever used FitVerse. The app hasn't launched.

**Why it matters:** This is a misrepresentation exposure under the Consumer Protection Act 2019 and the ASCI code. More practically — if a single person notices this at launch and posts about it, the brand damage is permanent and we'd be defending it during the exact week we want good press.

**What we do:** Remove all five before anything else on this list. The card layout stays exactly as it is; only the content inside changes. See Decision 2 for what goes in its place.

### 2. The FAQ makes promises we can't keep

Three separate problems in six questions:

| Question | Current answer | Problem |
|---|---|---|
| *"Will FitVerse guarantee I hit my fitness goals?"* | **"Yes."** | No fitness product can guarantee body-composition outcomes. Contradicts our own Terms of Service. |
| *"Is my health data safe?"* | **"Completely."** | Our own Privacy Policy correctly says no system is 100% secure. |
| *"Is FitVerse free to download?"* | **"Yes… free plan… Pro unlocks…"** | We have no free plan and no tier called Pro. |

**What we do:** Rewrite those three answers, and expand the FAQ from 6 to 10–12 questions. The current set skips everything people actually ask before launch — which wearables sync, can I export my data, how do I cancel, does it work offline, what's the refund policy.

### 3. Pricing says three different things at once

| Where it appears | What it says |
|---|---|
| The pricing pop-up | ₹299 / ₹199 / ₹149 per month. No free tier. |
| The FAQ | Free to download, with a paid "Pro" upgrade. |
| The code Google reads | Price: ₹0 |

A prospective customer can find all three in under a minute. Google reading a ₹0 price while the page shows ₹299 is the exact pattern its guidelines treat as misleading markup.

**What we do:** Pick one pricing story (Decision 4) and push it to all three places. Separately, the three "Start Monthly / Start 6-Month / Start Yearly" buttons currently **do nothing when clicked** — they need to either go to the waitlist or say "Notify me at launch".

### 4. Our security settings have never been live

We wrote a full set of security protections — the rules that stop other sites embedding ours, block malicious scripts, and control what data leaks to third parties. They're in a file called `next.config.ts`.

**The version of Next.js we're on doesn't read that file type.** It only reads `.js` and `.mjs` files. There's a second config file, `next.config.mjs`, that the build *does* read — and it has no security settings in it at all.

I confirmed this directly against the Next.js source installed in the project, so it isn't a guess.

**What we do:** Move the settings into the file the build actually reads, then verify against the live site before launch. Small fix, roughly ten minutes, but it's currently a real gap.

---

## Two things in the brief that didn't match the code

**The "sarcastic competitor logos" idea has no competitor logos to replace.** The Problem section shows five *generic category* tiles — Nutrition, Workout, Sleep, Meditation, Community — with abstract icons. No competitor brands appear anywhere. The parody idea still works, but it starts from scratch rather than from a swap. See Decision 1.

**Good news on fake statistics:** there are none. No "10,000+ users", no download counts, no transformation numbers anywhere on the site. That box is already ticked. The honesty problem lives entirely in the testimonials.

**One thing nobody flagged:** there is **no About section**, but both the navbar and the footer link to one. The navbar quietly sends you to the feature rail instead; the footer link goes nowhere at all. For a product about to ask people for payment details, having no "who are we" content is a real trust gap.

---

## What else needs fixing

Grouped by theme, in plain terms.

**The site is slow, and Google will notice.**
Every visit downloads about 10 MB — four product screenshots at 1.8–2.6 MB each, plus a 1.6 MB video. The images are served completely raw: no compression, no modern formats, no mobile-sized versions. For a product targeting Indian mobile users, this is the difference between passing and failing Google's speed assessment, which feeds directly into search ranking. **This is the single highest-impact fix on the list** and it's invisible to the eye — the images look identical afterwards.

**Keyboard users can't use the site's best features.**
The FAQ accordion, the before/after slider, and the feature rail are all built to respond to a mouse only. Someone navigating by keyboard — or using a screen reader — can reach the navigation, the buttons and the signup form, and nothing else. Our three signature interactions are the three they can't touch. The waitlist form also has no labels, so a screen reader announces two unlabelled boxes and, after submitting, says nothing at all about whether it worked.

**Some text is too faint to read.**
Not a matter of taste — it fails the measurable accessibility standard. The worst offender is the "Drag to reveal" hint on the comparison slider, which is the one instruction explaining how the section works. Also affected: the footer's bottom row, the pricing pop-up's billing text, and the FAQ's *open* question colour — which is currently harder to read than the closed one.

**Nothing respects "reduce motion".**
Some people get motion sickness from animation; their devices have a setting for it. We ignore it entirely. Running at all times: a looping video, a pulsing ring, a bouncing arrow, two nudging arrows, a 40-second scrolling review carousel that can't be paused, and a permanent animation loop that never sleeps even when off-screen.

**Search engines can't find half of what we offer.**
No sitemap, no robots file. The social share image is referenced but **doesn't exist** — every WhatsApp forward and LinkedIn post of our link currently shows a blank box. The homepage headline is the single word "FitVerse", which tells Google nothing about what we do. Pricing lives in a pop-up, so it's invisible to search entirely.

**Small things that add up.**
Legal pages dated January 2025 on a product that hasn't launched. Copyright year hardcoded to 2026 — correct today, wrong in January. A stock photo from Unsplash sitting among four real product screenshots on the Features page. Two different logos on the same page (the navbar uses a JPEG, the footer uses a drawn icon). A font loaded with six weights and used nowhere. The README is still the unmodified Next.js starter template.

---

## Decisions we need from the team

Work is blocked on these. Each has my recommendation.

**1 · The Problem section — what replaces the generic tiles?**
Options: (a) keep the category tiles, improve the visuals; (b) use real competitor logos; (c) create witty fictional app parodies, as originally briefed.
→ **Recommend (c).** Note that (b) carries trademark risk and comparative-advertising exposure under the ASCI code — it's the reason most products avoid it.

**2 · The Reviews section — what goes there until we have real users?**
Options: waitlist momentum, founder/product principles, an honest "Reviews arrive when our users do" placeholder, or leave the section out until launch.
→ **No recommendation — this is a brand voice call.** Whatever we choose, I'll build the card around a proper rating/source structure now, so plugging in Google, Play Store and App Store reviews later is a data swap rather than a rebuild.

**3 · The hero video and the 8K request.**
An 8K master would be roughly 20–60× the current file size and would badly damage load speed on exactly the mobile networks we're targeting — working directly against the SEO goal.
→ **Recommend: source the 8K master, ship an optimised 1080p/1440p version.** Visually identical to virtually every visitor, since almost nobody has an 8K screen. We get the quality without the penalty.

**4 · Is there a free tier or not?**
Everything in blocker #3 depends on this one answer.

**5 · Do we have a launch date we can name?**
The FAQ currently dodges the question visitors most want answered.

**6 · Do our Instagram / X / LinkedIn accounts exist?**
All three icons currently link to nothing. If the accounts aren't live, better to remove the icons than link to nowhere.

**7 · "About" — relabel, or build it?**
Relabelling the link fits our no-structural-change rule. Building a real About section doesn't — that needs an explicit exception from the team.

**8 · Pricing is invisible to Google.**
It's in a pop-up, so it can't be indexed or linked to. Pricing is a top-three search term for any subscription product. Surfacing it as a page section would breach the no-structural-change rule — do we want to authorise that exception, or accept the loss?

**9 · Cookie consent banner before launch?**
Our Cookie Policy describes analytics and preference cookies. We have no consent mechanism for them.

**10 · Payment and onboarding.**
The brief mentions both. Neither exists in the code today. In scope for this pass, or a later phase? It changes what the pricing buttons should do.

**11 · The UI reference repo and v3.1 design haven't been shared yet.** Phase 2 can't start without them.

---

## The plan

### Phase 1 — Content only (starts on approval)

No visual changes. No layout changes. Words, links, and settings only — so it can be reviewed by reading, not by clicking through.

1. Remove the fabricated testimonials
2. Fix the three FAQ answers that overpromise
3. Reconcile pricing across all three places
4. Move the security settings into the file that's actually read
5. Fix the four dead footer links and the mislabelled "About"
6. Write the new hero headline, tagline and description
7. Create the missing social share image; fix the search metadata
8. Expand the FAQ to 10–12 real questions
9. Re-date the legal pages
10. Flesh out the thin section descriptions

### Phase 2 — Visual and technical (after content sign-off)

Needs the reference repo and v3.1 design. Same skeleton throughout.

1. **Accessibility** — make the FAQ, slider and feature rail keyboard-usable; label the signup form; fix the faint text; honour "reduce motion"
2. **Speed** — compress and modernise the images, add a video poster frame, stop the always-on animation loop
3. **Polish** — one consistent font system, one logo, replace the stock photo, fix the mobile layout issues

---

## What I need to proceed

Approval on Phase 1, plus answers to **Decisions 1, 2, 3 and 4** — those four gate real work. The rest can be answered as we go.

Nothing has been changed in the codebase. Both this brief and the full audit are read-only.
