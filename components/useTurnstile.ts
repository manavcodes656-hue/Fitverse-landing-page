"use client";

import { useCallback, useEffect, useRef } from "react";

/* Cloudflare Turnstile, invisible mode. The widget is rendered once with
   execution "execute", so no challenge runs until the visitor submits the form.
   Without NEXT_PUBLIC_TURNSTILE_SITE_KEY nothing loads and getToken() is null. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 15000;

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const turnstileEnabled = Boolean(SITE_KEY);

export function useTurnstile() {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const settle = useRef<((token: string | null) => void) | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const mount = () => {
      const api = window.turnstile;
      if (cancelled || !api || !holder.current || widgetId.current) return;
      widgetId.current = api.render(holder.current, {
        sitekey: SITE_KEY,
        execution: "execute",
        callback: (token: string) => settle.current?.(token),
        "error-callback": () => settle.current?.(null),
        "expired-callback": () => settle.current?.(null),
      });
    };

    if (window.turnstile) {
      mount();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }

    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  /* Resolves with a fresh token, or null if the challenge fails, is blocked or
     takes too long. Never retries on its own. */
  const getToken = useCallback(
    () =>
      new Promise<string | null>((resolve) => {
        const api = window.turnstile;
        if (!SITE_KEY || !api || !widgetId.current) return resolve(null);
        const timer = setTimeout(() => { settle.current = null; resolve(null); }, TOKEN_TIMEOUT_MS);
        settle.current = (token) => { clearTimeout(timer); settle.current = null; resolve(token); };
        api.reset(widgetId.current);
        api.execute(widgetId.current);
      }),
    []
  );

  return { holder, getToken };
}
