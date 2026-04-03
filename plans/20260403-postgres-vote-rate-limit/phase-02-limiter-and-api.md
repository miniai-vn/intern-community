# Phase 02: Limiter Service and API Integration

## Overview

- Priority: High
- Status: Completed
- Goal: Replace in-memory rate limiting with a transaction-safe PostgreSQL limiter and wire it into `POST /api/votes`.

## Context Links

- [route.ts](/home/toan-huynh/Downloads/intern-community/src/app/api/votes/route.ts)
- [db.ts](/home/toan-huynh/Downloads/intern-community/src/lib/db.ts)

## Key Insights

- Correctness problem is concurrency, not storage alone.
- Two parallel requests can both see count `9` and both pass unless serialized.
- Advisory lock per user is the simplest robust guard for this scope.

## Requirements

- Enforce `10` vote requests per `60` seconds per authenticated user.
- Return HTTP `429` with a descriptive error when exceeded.
- Remain correct across multiple app instances sharing the same DB.
- Keep vote-toggle transaction behavior intact.

## Architecture

Create a dedicated helper, e.g. `src/lib/rate-limit.ts`.

Core flow:

```ts
await db.$transaction(async (tx) => {
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(hashtext("votes"), hashtext(${userId}))
  `;

  await tx.$executeRaw`
    DELETE FROM "rate_limit_events"
    WHERE "scope" = "votes"
      AND "userId" = ${userId}
      AND "createdAt" < NOW() - make_interval(secs => 60)
  `;

  const [{ count }] = await tx.$queryRaw`
    SELECT COUNT(*)::bigint AS count
    FROM "rate_limit_events"
    WHERE "scope" = "votes"
      AND "userId" = ${userId}
      AND "createdAt" >= NOW() - make_interval(secs => 60)
  `;

  if (Number(count) >= 10) throw new RateLimitExceededError();

  await tx.rateLimitEvent.create({
    data: { scope: "votes", userId },
  });
});
```

Important:
- Lock key should include scope, e.g. `votes:${userId}`.
- Use transaction-scoped advisory lock, not session lock.
- If Prisma transaction API makes advisory lock awkward, use targeted raw SQL inside the same transaction. Keep raw SQL small and isolated.

## Related Code Files

- Create: `/home/toan-huynh/Downloads/intern-community/src/lib/rate-limit.ts`
- Modify: `/home/toan-huynh/Downloads/intern-community/src/app/api/votes/route.ts`
- Optional modify: `/home/toan-huynh/Downloads/intern-community/src/lib/db.ts` only if helper typing/transaction usage requires it

## Implementation Steps

1. Add a small `assertVoteRateLimit(userId: string)` helper.
2. Inside helper:
   - start transaction
   - acquire advisory transaction lock for `votes:${userId}`
   - delete stale rows for the current user/scope window
   - count rows in last 60 seconds
   - if count >= 10, throw typed error with retry hint
   - else insert new event
3. In `POST /api/votes`, call helper after auth and before mutating votes.
4. On rate-limit error, return:
   - status `429`
   - message like `Rate limit exceeded: max 10 vote requests per 60 seconds. Please try again shortly.`
   - optional `Retry-After` header
5. Remove old in-memory `Map` code and TODO comment.

## Todo List

- [x] Create rate limit helper
- [x] Add typed error or structured result
- [x] Integrate helper into vote route
- [x] Return descriptive `429`
- [x] Remove in-memory limiter

## Success Criteria

- Parallel requests for same user do not exceed configured quota.
- Requests from different users are not blocked by each other.
- Existing unauthorized, bad request, vote, and un-vote flows still work.

## Execution Notes

- Added `src/lib/rate-limit.ts`.
- Replaced in-memory `Map` in `src/app/api/votes/route.ts`.
- Added `Retry-After` header support on `429`.
- Added targeted route tests for unauthorized and rate-limited flows.

## Risk Assessment

- Raw SQL hashing choice must be deterministic. Keep lock key generation simple.
- Cleanup inside hot path can become expensive if done too aggressively.
- Cleanup only affects the current user. Inactive users' old rows still need a broader retention strategy later.
- Mixing limiter transaction and vote mutation transaction should stay understandable. Avoid giant all-in-one transaction if not needed.

## Security Considerations

- Rate limiting remains user-scoped, authenticated only.
- Error message should be descriptive but not expose internals.

## Next Steps

- Phase 03 validates behavior and documents trade-offs.
