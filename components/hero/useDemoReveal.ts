import { useEffect, type RefObject } from "react";

/* Timings, in ms. */
const SAFETY_MS = 7000;          // the intro can never leave the hero invisible longer than this
const INTRO_SETTLE_MS = 2000;    // .pre (the hidden state) is lifted this long after .intro starts
const PHONE_CHECK_MS = 2000;     // text intro ends ~1s in; a frame already on screen reveals 1s later
const PLAY_DELAY_DESKTOP_MS = 2700;
const PLAY_DELAY_PHONE_MS = 900; // the phone rise is 0.8s, so play as it lands
const SCROLL_TRIGGER_PX = 24;
const VISIBLE_RATIO = 0.35;
const PHONE_QUERY = "(max-width: 767px)";

/* Load sequence: the words rise one by one (.intro). The demo window rises on
   the first scroll or touch (.reveal), then the video plays. On phones, a frame
   already on screen reveals itself without waiting for a scroll. */
export function useDemoReveal(
  rootRef: RefObject<HTMLElement | null>,
  demoRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  setNeedsTap: (v: boolean) => void
) {
  useEffect(() => {
    const root = rootRef.current;
    const demo = demoRef.current;
    const video = videoRef.current;
    if (!root) return;

    const phoneMq = window.matchMedia(PHONE_QUERY);
    let playTimer: ReturnType<typeof setTimeout> | undefined;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;
    let inViewTimer: ReturnType<typeof setTimeout> | undefined;
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    let io: IntersectionObserver | null = null;
    let armed = false;

    const disarm = () => {
      armed = false;
      window.removeEventListener("scroll", onFirstScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onWheel);
      io?.disconnect();
      io = null;
    };
    const revealDemo = () => {
      if (!demo || demo.classList.contains("reveal")) return;
      demo.classList.add("reveal");
      clearTimeout(playTimer);
      const phone = phoneMq.matches;
      playTimer = setTimeout(() => {
        const started = video?.play();
        if (started) started.catch(() => { if (phone) setNeedsTap(true); });
      }, phone ? PLAY_DELAY_PHONE_MS : PLAY_DELAY_DESKTOP_MS);
    };
    /* Every trigger funnels through here, and revealDemo is idempotent, so the
       scroll, wheel, touch and observer paths cannot race each other. */
    const trigger = () => { disarm(); revealDemo(); };
    function onFirstScroll() {
      if (armed && (window.scrollY || 0) > SCROLL_TRIGGER_PX) trigger();
    }
    function onWheel(e: Event) {
      if (armed && (e.type === "touchmove" || ((e as WheelEvent).deltaY || 0) > 0)) trigger();
    }
    const armDemo = () => {
      if (!demo) return;
      disarm();
      armed = true;
      window.addEventListener("scroll", onFirstScroll, { passive: true });
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchmove", onWheel, { passive: true });
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(
          (entries) => {
            const seen = entries.some((e) => e.isIntersecting && e.intersectionRatio > VISIBLE_RATIO);
            if (seen && (window.scrollY || 0) > SCROLL_TRIGGER_PX) trigger();
          },
          { threshold: [VISIBLE_RATIO] }
        );
        io.observe(demo);
      }
    };
    const rewind = (to: number) => {
      if (!video) return;
      try { video.pause(); video.currentTime = to; } catch { /* metadata not loaded yet */ }
    };
    const resetDemo = () => {
      if (!demo) return;
      demo.classList.remove("reveal");
      void demo.offsetWidth; // restart the CSS animation
      clearTimeout(playTimer);
      setNeedsTap(false);
      rewind(0.05);
      armDemo();
    };
    const runIntro = () => {
      if (document.hidden) return;
      root.classList.remove("intro");
      root.classList.add("pre");
      void root.offsetWidth;
      rewind(0);
      clearTimeout(playTimer);
      clearTimeout(doneTimer);
      clearTimeout(inViewTimer);
      /* Re-armed on every run: even if the frames below never fire (tab hidden
         mid-call), .pre is still lifted. */
      clearTimeout(safetyTimer);
      safetyTimer = setTimeout(() => root.classList.remove("pre"), SAFETY_MS);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          root.classList.add("intro");
          doneTimer = setTimeout(() => root.classList.remove("pre"), INTRO_SETTLE_MS);
          inViewTimer = setTimeout(() => {
            if (!phoneMq.matches || !demo || !armed) return;
            if (demo.getBoundingClientRect().top < window.innerHeight - 40) trigger();
          }, PHONE_CHECK_MS);
        });
      });
    };

    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) runIntro(); };
    const onVisibility = () => {
      if (!document.hidden && !root.classList.contains("intro")) runIntro();
    };
    const onLoaded = () => { if (video?.paused) rewind(0.05); };
    /* Phones get no native player chrome: the frame stays hidden until revealed,
       and the only control that may ever show is the fallback play button. */
    if (video && phoneMq.matches) video.controls = false;

    video?.addEventListener("loadeddata", onLoaded, { once: true });
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    const w = window as unknown as { replayIntro?: () => void };
    w.replayIntro = () => { runIntro(); resetDemo(); };
    try {
      runIntro();
      armDemo();
    } catch {
      /* Whatever failed, never leave the hero hidden. */
      root.classList.remove("pre");
      demo?.classList.add("reveal");
    }

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(playTimer);
      clearTimeout(doneTimer);
      clearTimeout(inViewTimer);
      cancelAnimationFrame(raf);
      disarm();
      video?.removeEventListener("loadeddata", onLoaded);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      delete w.replayIntro;
    };
  }, [rootRef, demoRef, videoRef, setNeedsTap]);
}
