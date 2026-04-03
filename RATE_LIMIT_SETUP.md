# Upstash Rate Limit Setup (`POST /api/votes`)

This section explains how rate limiting for POST /api/votes is implemented using Upstash Redis and how to configure it for local and production environments.

## What is configured

- Endpoint: `POST /api/votes`
- Scope: per authenticated user (`session.user.id`)
- Policy: max `10` requests per `60` seconds
- Algorithm: sliding window
- On limit exceeded:
  - HTTP status `429`
  - JSON error message
  - `Retry-After` header (seconds)

## Dependencies

Installed packages:

- `@upstash/redis`
- `@upstash/ratelimit`

## Environment variables

Add these variables to your local `.env`:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

They are also listed in `.env.example`.
You can find these values in your Upstash Redis database dashboard `https://upstash.com` under the “REST API” / “Connect” section.

## File map

- `src/lib/rate-limit.ts`
  - Creates `Redis.fromEnv()` client
  - Exports `voteRatelimit`
- `src/app/api/votes/route.ts`
  - Calls `voteRatelimit.limit(session.user.id)`
  - Returns `429` + `Retry-After` when blocked

## Local verification

1. Start app: `pnpm dev`
2. Sign in with a test user.
3. Trigger `POST /api/votes` quickly more than 10 times within 60s.
4. Confirm response becomes `429`.
5. Confirm response includes `Retry-After` header.

## Notes

- This is production-friendly for multi-instance deployments because limit state is stored in Redis, not in memory.
- If Upstash env vars are missing, runtime calls to `Redis.fromEnv()` will fail. Ensure `.env` is configured before starting the app.
