---
title: "PostgreSQL Vote Rate Limiting Plan"
description: "Replace in-memory vote rate limiting with a PostgreSQL-backed, concurrency-safe limiter for POST /api/votes."
status: completed
priority: P2
effort: 5h
branch: master
tags: [feature, backend, database, api]
created: 2026-04-03
---

# PostgreSQL Vote Rate Limiting Plan

## Overview

Replace the in-memory `Map` in `POST /api/votes` with a PostgreSQL-backed limiter that enforces max `10` vote actions per user per `60` seconds, returns `429` with a descriptive message, and remains correct across multiple app instances.

## Constraints

- Keep current stack. PostgreSQL + Prisma already exist.
- Avoid adding Redis infra for this challenge.
- Must handle concurrency, not just single-request happy path.
- Must preserve existing auth and vote toggle behavior.

## Chosen Approach

Use a `rate_limit_events` table in PostgreSQL plus a transaction-scoped advisory lock keyed by `userId`.

Why:
- Shared DB already exists across instances.
- Advisory lock serializes competing requests for the same user.
- No new vendor. Easier local setup. Stronger architectural explanation if implemented correctly.

## Phases

| # | Phase | Status | Effort | Link |
|---|---|---|---|---|
| 1 | Schema and migration | Completed | 1h | [phase-01](./phase-01-schema-and-migration.md) |
| 2 | Limiter service and API integration | Completed | 2.5h | [phase-02](./phase-02-limiter-and-api.md) |
| 3 | Testing and verification | Completed | 1.5h | [phase-03](./phase-03-testing-and-verification.md) |

## Architecture Summary

1. Authenticated request enters `POST /api/votes`.
2. Rate limiter opens DB transaction.
3. Acquire advisory lock for `vote-rate-limit:{userId}`.
4. Count events for that user in last `60 seconds`.
5. If count `>= 10`, reject with `429`.
6. Else insert new event, commit, continue vote toggle.

## Key Risks

- Naive `count + insert` without lock is race-prone.
- Table can grow unbounded without cleanup policy.
- Prisma may not express advisory-lock flow cleanly; raw SQL may be required.

## Deliverables

- New plan-safe schema for rate limit events.
- Reusable rate limiter helper in `src/lib/`.
- Updated `POST /api/votes` behavior with descriptive `429`.
- Tests covering route behavior and limiter helper logic.
- Verification evidence for lint, typecheck, and test results.

## Progress Notes

- Completed: schema update, migration file, Prisma client generation.
- Completed: PostgreSQL-backed limiter helper and route integration.
- Completed: route tests for `401`, `400`, `429`, `503`, vote, and un-vote paths.
- Completed: unit tests for limiter errors, success path, and missing-table fallback.
- Verified: `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
- Blocked by environment: `pnpm build` fails on external Google Fonts fetch for `Geist`.
- Not verified in this session: applying schema to a live local PostgreSQL instance.
