import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getResend, isEmailConfigured, fromAddress } from "@/lib/resend";
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/email-templates";

// ─── Rate limiting (in-memory, per IP) ───────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Hash IP with SHA-256 ─────────────────────────────────────────────────────
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = process.env.IP_HASH_SALT ?? "fitverse-salt";
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Validation schema ────────────────────────────────────────────────────────
const waitlistSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .toLowerCase()
    .trim(),
});

// ─── CORS / security headers ──────────────────────────────────────────────────
function secureHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean);

  const isAllowed = !origin || allowedOrigins.some((o) => origin.startsWith(o));

  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin ?? "*") : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

// ─── OPTIONS (preflight) ──────────────────────────────────────────────────────
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: secureHeaders(request.headers.get("origin")),
  });
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = secureHeaders(origin);

  try {
    // Get IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const ipHash = await hashIP(ip);

    // Rate limit
    if (!checkRateLimit(ipHash)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400, headers }
      );
    }

    // Validate
    const result = waitlistSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "validation", details: result.error.flatten().fieldErrors },
        { status: 422, headers }
      );
    }

    const { name, email } = result.data;

    // Insert into Supabase via service role (bypasses RLS)
    const db = getSupabaseAdmin();
    const { error: dbError } = await db
      .from("waitlist")
      .insert({ name, email, source: "website", ip_hash: ipHash });

    if (dbError) {
      /* TEMP DEBUG — remove once the waitlist failure is diagnosed.
         Logged BEFORE the duplicate branch so every DB failure is visible.
         .message alone is near-useless for PostgREST; code/details/hint are
         what actually identify the failure. */
      console.error("=== SUPABASE INSERT ERROR =======================");
      console.error("message:", dbError.message);
      console.error("code:   ", dbError.code);
      console.error("details:", dbError.details);
      console.error("hint:   ", dbError.hint);
      console.error("full:   ", dbError);
      console.error("json:   ", JSON.stringify(dbError, null, 2));
      console.error("=================================================");

      if (
        dbError.code === "23505" ||
        dbError.message?.toLowerCase().includes("duplicate") ||
        dbError.message?.toLowerCase().includes("unique")
      ) {
        return NextResponse.json(
          { success: false, error: "duplicate" },
          { status: 409, headers }
        );
      }
      return NextResponse.json(
        // TEMP DEBUG: `debug` is echoed to the browser. Remove before deploy.
        { success: false, error: "database_error", debug: dbError },
        { status: 500, headers }
      );
    }

    /* The signup is already durable at this point. The welcome email is a
       nice-to-have, so every failure below is swallowed into emailSent:false
       rather than being surfaced as a failed signup. It is still awaited —
       a fire-and-forget promise can be killed when the serverless function
       returns, which silently drops the mail. */
    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        const { error: mailError } = await getResend().emails.send({
          from: fromAddress(),
          to: email,
          subject: "You're on the FitVerse waitlist 🎉",
          html: welcomeEmailHtml(name),
          text: welcomeEmailText(name),
        });
        if (mailError) console.error("Resend error:", mailError);
        else emailSent = true;
      } catch (err) {
        console.error("Resend threw:", err);
      }
    } else {
      console.warn("RESEND_API_KEY not set — skipping welcome email for", email);
    }

    // Never return the inserted record
    return NextResponse.json({ success: true, emailSent }, { status: 201, headers });
  } catch (error) {
    // TEMP DEBUG — remove once the waitlist failure is diagnosed.
    const err = error as Error & { cause?: unknown };
    console.error("=== WAITLIST API THREW ==========================");
    console.error("name:   ", err?.name);
    console.error("message:", err?.message);
    console.error("cause:  ", err?.cause);
    console.error("stack:  ", err?.stack);
    console.error("full:   ", error);
    try {
      console.error(
        "json:   ",
        JSON.stringify(error, Object.getOwnPropertyNames(Object(error)), 2)
      );
    } catch {
      console.error("json:    <not serializable>");
    }
    console.error("=================================================");

    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        // TEMP DEBUG: echoed to the browser. Remove before deploy.
        debug: { name: err?.name, message: err?.message, stack: err?.stack },
      },
      { status: 500, headers }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
