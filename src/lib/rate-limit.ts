import { Redis } from '@upstash/redis'
import { Ratelimit } from "@upstash/ratelimit"
const redis = Redis.fromEnv()

export const voteRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rate-limit:votes"
})

export const moduleRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "rate-limit:modules"
})
