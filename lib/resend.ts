import { Resend } from "resend";

let _resend: Resend | null = null;

/** True when a real API key is configured. Lets callers skip sending in dev. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Lazy client — instantiating at module scope would blow up the build on
 * machines without the key. Only call this behind isEmailConfigured().
 */
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");
    _resend = new Resend(key);
  }
  return _resend;
}

/**
 * The verified sender. Resend rejects any From address on an unverified
 * domain, so default to their shared testing sender — it works out of the box
 * but can only deliver to the address that owns the Resend account.
 */
export function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "FitVerse <onboarding@resend.dev>";
}
