import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* Sliding-window limit per key: 5 requests per 10 minutes.
   Production uses Upstash Redis, so the count is shared across every server
   instance. If it is not configured or unreachable in production the limiter
   fails CLOSED ("unavailable"), never open. Development without Upstash falls
   back to an in-memory counter. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MEMORY_PRUNE_AT = 1000;

export type RateResult = "ok" | "limited" | "unavailable";

const isProd = process.env.NODE_ENV === "production";
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const upstash =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(LIMIT, "10 m"),
        prefix: "fitverse:waitlist",
      })
    : null;

const memory = new Map<string, { count: number; resetAt: number }>();

function checkMemory(key: string): boolean {
  const now = Date.now();
  if (memory.size > MEMORY_PRUNE_AT) {
    memory.forEach((v, k) => { if (now > v.resetAt) memory.delete(k); });
  }
  const entry = memory.get(key);
  if (!entry || now > entry.resetAt) {
    memory.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

let warned = false;
function warnOnce(message: string) {
  if (warned) return;
  warned = true;
  console.warn(message);
}

export async function checkRateLimit(key: string): Promise<RateResult> {
  if (upstash) {
    try {
      const { success } = await upstash.limit(key);
      return success ? "ok" : "limited";
    } catch (err) {
      console.error("rate limit: Upstash request failed", err instanceof Error ? err.message : "unknown");
      if (isProd) return "unavailable";
      return checkMemory(key) ? "ok" : "limited";
    }
  }
  if (isProd) {
    console.error("rate limit: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set; rejecting requests");
    return "unavailable";
  }
  warnOnce("rate limit: Upstash is not configured; using the in-memory limiter (development only)");
  return checkMemory(key) ? "ok" : "limited";
}
