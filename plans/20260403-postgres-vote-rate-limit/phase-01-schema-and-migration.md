# Phase 01: Schema and Migration

## Overview

- Priority: High
- Status: Completed
- Goal: Add durable storage for vote rate-limit events with indexes that make a 60-second sliding-window query cheap.

## Context Links

- [route.ts](/home/toan-huynh/Downloads/intern-community/src/app/api/votes/route.ts)
- [schema.prisma](/home/toan-huynh/Downloads/intern-community/prisma/schema.prisma)
- [db.ts](/home/toan-huynh/Downloads/intern-community/src/lib/db.ts)

## Key Insights

- Current limiter is process-local only. Fails on restart and multi-instance.
- This app already depends on PostgreSQL and Prisma. Reuse infra first.
- Query pattern is bounded by `userId + scope + createdAt >= now() - 60s`. Index for that exact shape.

## Requirements

- Persist rate-limit events in PostgreSQL.
- Support `10 requests / 60 seconds / user` for vote action scope.
- Keep solution generic enough to reuse for other endpoints later if needed.

## Architecture

Suggested model:

```prisma
model RateLimitEvent {
  id        String   @id @default(cuid())
  userId    String
  scope     String
  createdAt DateTime @default(now())

  @@index([scope, userId, createdAt])
  @@map("rate_limit_events")
}
```

Notes:
- `scope` should be explicit, e.g. `votes`.
- One table is enough. Do not over-model with quotas/config tables.

## Related Code Files

- Modify: `/home/toan-huynh/Downloads/intern-community/prisma/schema.prisma`
- Create: migration generated from Prisma CLI

## Implementation Steps

1. Add `RateLimitEvent` model to Prisma schema.
2. Add compound index on `(scope, key, createdAt)`.
2. Add compound index on `(scope, userId, createdAt)`.
3. Generate/apply migration.
4. Confirm Prisma client types include the new model.
5. Decide retention strategy:
   - Minimal challenge scope: lazy delete old rows during limiter execution.
   - Better long term: scheduled cleanup job. Document, do not overbuild now.

## Todo List

- [x] Add `RateLimitEvent` model
- [x] Add index for sliding-window lookup
- [x] Generate migration
- [x] Confirm client generation succeeds
- [x] Document retention choice

## Success Criteria

- Schema supports shared persistent rate-limit state.
- Query path for last 60 seconds can use the added index.
- Migration applies locally without touching unrelated models.

## Execution Notes

- Added Prisma model in `prisma/schema.prisma`.
- Added SQL migration in `prisma/migrations/20260403110000_add_vote_rate_limit_events/migration.sql`.
- `pnpm db:generate` passed.
- `pnpm exec prisma validate` passed.
- Schema application against a live local PostgreSQL instance was not verified in this session.

## Risk Assessment

- Index missing or wrong order can hurt query performance.
- Using `userId` keeps the model specific to this endpoint. Reuse for non-user limits would need a follow-up refactor.

## Security Considerations

- No sensitive payload beyond internal user identifier.
- Avoid logging raw lock keys or PII unnecessarily.

## Next Steps

- Phase 02 depends on this schema existing.
