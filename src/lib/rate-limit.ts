import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Sliding window: max 10 votes per user per 60-second window.
// Uses Upstash Redis as a shared store so the limit works correctly
// across multiple server instances / serverless cold starts.
//
// Trade-off vs in-memory Map:
//   + Survives server restarts and works in multi-process deployments
//   + Accurate under concurrent load (Redis atomic ZADD/ZRANGEBYSCORE)
//   - Adds a network round-trip (~1–5 ms on Upstash edge) per vote request
//   - Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars
//
// For local development without Upstash credentials, set
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to empty strings —
// the ratelimiter will be undefined and votes/route.ts falls back gracefully.

function createRatelimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "intern-community:votes",
  });
}

export const voteRatelimit = createRatelimiter();
