import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
// Throws at runtime if env vars are missing.
const redis = Redis.fromEnv();

// Shared limiter for vote endpoint:
// - Algorithm: sliding window
// - Capacity: 10 requests
// - Window: 60 seconds
// - Prefix isolates keys in Redis so this limiter does not collide with others.
const voteRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl:vote",
});

export { voteRatelimit };