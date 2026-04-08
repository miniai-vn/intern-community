const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Simple in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// TODO [medium-challenge]: Replace this with a proper rate limiter

type Props = {
  namespace: "votes" | "bookmarks";
  key: string;
  limit: number;
  windowMs: number;
};

export function rateLimit(params: Props): boolean {
  const compositeKey = `${params.namespace}:${params.key}`;

  const now = Date.now();
  const entry = rateLimitMap.get(compositeKey);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(compositeKey, {
      count: 1,
      resetAt: now + params.windowMs,
    });
    return true;
  }
  if (entry.count >= params.limit) return false;
  entry.count++;
  return true;
}
