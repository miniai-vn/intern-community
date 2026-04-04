/**
 * Simple in-memory sliding-window rate limiter (per-process).
 * Suitable for dev/single-instance; use Redis (e.g. Upstash) in production.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  options: { max: number; windowMs: number }
): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }
  if (entry.count >= options.max) return false;
  entry.count += 1;
  return true;
}
