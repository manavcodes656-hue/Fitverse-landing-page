/* Cloudflare Turnstile server-side verification. Runs before any database or
   email work. A missing secret fails closed in production; in development it is
   skipped with a warning so the form still works without a Cloudflare account. */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const TIMEOUT_MS = 5000;

export type TurnstileResult = "valid" | "invalid" | "unavailable";

let warned = false;

export async function verifyTurnstile(token: unknown, ip: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("turnstile: TURNSTILE_SECRET_KEY is not set; rejecting requests");
      return "unavailable";
    }
    if (!warned) {
      warned = true;
      console.warn("turnstile: TURNSTILE_SECRET_KEY is not set; skipping verification (development only)");
    }
    return "valid";
  }

  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) return "invalid";

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      console.error("turnstile: verify endpoint returned", res.status);
      return "unavailable";
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? "valid" : "invalid";
  } catch (err) {
    console.error("turnstile: verify request failed", err instanceof Error ? err.message : "unknown");
    return "unavailable";
  }
}
