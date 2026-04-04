import { db } from "@/lib/db";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

/**
 * Sliding-window rate limiter backed by PostgreSQL.
 *
 * Why PostgreSQL instead of in-memory Map:
 * - The in-memory Map resets on every server restart and doesn't work across
 *   multiple processes/instances (e.g. Vercel serverless functions).
 * - PostgreSQL is already a project dependency — no new infrastructure needed.
 *
 * Trade-off: one extra DB round-trip per vote request. Acceptable at this scale.
 * At higher scale, replace with Redis (e.g. Upstash) for sub-millisecond latency.
 *
 * Algorithm:
 * 1. Count events for this user in the last 60 seconds.
 * 2. If count >= 10, reject.
 * 3. Otherwise, insert a new event and allow.
 * 4. Opportunistically delete stale events (older than 60s) to keep the table small.
 *    Deletion runs after the response is sent so it doesn't add latency.
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const count = await db.rateLimitEvent.count({
    where: {
      userId,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= MAX_REQUESTS) return false;

  // Record this attempt
  await db.rateLimitEvent.create({ data: { userId } });

  // Clean up stale rows for this user (fire-and-forget — don't await)
  db.rateLimitEvent
    .deleteMany({ where: { userId, createdAt: { lt: windowStart } } })
    .catch(() => {
      // Non-critical — stale rows are harmless, just wasteful
    });

  return true;
}
