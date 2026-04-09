import { redis } from "@/lib/redis";

const WINDOW_SIZE = 60 * 1000;
const MAX_REQUESTS = 10;

export async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `rate_limit:${userId}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE;

  // remove old requests
  await redis.zremrangebyscore(key, 0, windowStart);

  // count current requests
  const count = await redis.zcard(key);

  if (count >= MAX_REQUESTS) {
    return false;
  }

  // add current request
  await redis.zadd(key, {
    score: now,
    member: `${now}-${Math.random()}`,
  });

  await redis.expire(key, 60);

  return true;
}