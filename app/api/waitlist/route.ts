import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getResend, isEmailConfigured, fromAddress } from "@/lib/resend";
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/email-templates";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

/* The waitlist endpoint is same-origin only: the form on this site is its one
   caller. Clients only ever see generic errors; details go to the server log. */

const MAX_BODY_BYTES = 2048;

// ─── IP hash salt ─────────────────────────────────────────────────────────────
/* The salt keeps stored IP hashes from being reversed by brute force. There is
   no fallback in production: a missing salt must stop the route, not weaken it.
   (Not enforced during `next build`, which imports this module without runtime
   secrets; the first request on a misconfigured server still fails.) */
const DEV_SALT = "dev-only-salt-do-not-use-in-production";

function loadSalt(): string {
  const salt = process.env.IP_HASH_SALT;
  if (salt) return salt;
  const building = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !building) {
    throw new Error("IP_HASH_SALT is not set. Set it to a long random string in the production environment.");
  }
  if (!building) console.warn("IP_HASH_SALT is not set; using a development-only salt.");
  return DEV_SALT;
}

const IP_SALT = loadSalt();

async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + IP_SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* x-real-ip is set by the platform proxy; the first x-forwarded-for entry is
   only trustworthy behind a proxy that overwrites it (Vercel does). */
function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
const waitlistSchema = z.object({
  /* No control characters and no angle brackets: a name has no use for them. */
  name: z.string().trim().min(2).max(80).regex(/^[^\u0000-\u001F\u007F<>]+$/),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
});

// ─── Responses ────────────────────────────────────────────────────────────────
const SECURITY_HEADERS = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

/* New signups, duplicates and honeypot hits all return exactly this, so the
   response never reveals whether an address is already registered. */
function ok() {
  return NextResponse.json({ success: true }, { status: 200, headers: SECURITY_HEADERS });
}

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status, headers: SECURITY_HEADERS });
}

/* Same-origin check: a browser always sends Origin on a cross-site POST. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser client; the rate limit still applies
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/* Reads the body with a hard size cap, whatever Content-Length claims. */
async function readJson(request: NextRequest): Promise<unknown | undefined> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return undefined;
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return fail(403, "forbidden");
    if (!request.headers.get("content-type")?.includes("application/json")) return fail(415, "invalid_request");

    const ip = clientIp(request);
    const ipHash = await hashIP(ip);
    const rate = await checkRateLimit(ipHash);
    if (rate === "limited") return fail(429, "rate_limited");
    if (rate === "unavailable") return fail(503, "unavailable");

    const body = await readJson(request);
    if (body === undefined || typeof body !== "object" || body === null) return fail(400, "invalid_request");

    /* Honeypot: humans never see this field. A bot that fills it gets the
       identical success response, and nothing is stored. */
    const fields = body as Record<string, unknown>;
    if (typeof fields.website === "string" && fields.website.trim() !== "") {
      console.warn("waitlist: honeypot filled, submission dropped");
      return ok();
    }

    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) return fail(422, "validation");
    const { name, email } = parsed.data;

    /* Bot check, before any database or email work. */
    const human = await verifyTurnstile(fields.turnstileToken, ip);
    if (human === "invalid") return fail(422, "validation");
    if (human === "unavailable") return fail(503, "unavailable");

    const { error: dbError } = await getSupabaseAdmin()
      .from("waitlist")
      .insert({ name, email, source: "website", ip_hash: ipHash });

    if (dbError) {
      /* Already registered: answer exactly like a new signup and send no email. */
      if (dbError.code === "23505") return ok();
      console.error("waitlist: insert failed", { code: dbError.code, message: dbError.message });
      return fail(500, "server_error");
    }

    /* The signup is already durable. The welcome email is a nice-to-have, so
       its failure never fails the signup. It is awaited because a
       fire-and-forget promise can be killed when a serverless function returns. */
    if (isEmailConfigured()) {
      try {
        const { error: mailError } = await getResend().emails.send({
          from: fromAddress(),
          to: email,
          subject: "You're on the FitVerse waitlist 🎉",
          html: welcomeEmailHtml(name),
          text: welcomeEmailText(name),
        });
        if (mailError) console.error("waitlist: email rejected", mailError.name);
      } catch (err) {
        console.error("waitlist: email threw", err instanceof Error ? err.message : "unknown");
      }
    } else {
      console.warn("waitlist: RESEND_API_KEY not set, welcome email skipped");
    }

    return ok();
  } catch (err) {
    console.error("waitlist: unhandled", err instanceof Error ? err.message : "unknown");
    return fail(500, "server_error");
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
