# Phase 03: Testing and Verification

## Overview

- Priority: Medium
- Status: Completed
- Goal: write tests for the new rate-limiter code and collect concrete verification evidence that the implementation works as intended.

## Context Links

- [package.json](/home/toan-huynh/Downloads/intern-community/package.json)
- [README.md](/home/toan-huynh/Downloads/intern-community/README.md)
- [CONTRIBUTING.md](/home/toan-huynh/Downloads/intern-community/CONTRIBUTING.md)

## Key Insights

- The strongest differentiator is not “used Postgres”, it is “used Postgres and made it correct”.
- Route-level tests alone are not enough if helper logic is untested.
- Verification should show both behavior and coverage, not just “tests pass”.

## Requirements

- Add tests for the new route behavior.
- Add tests for the rate-limiter helper and its error branches.
- Ensure no regressions in existing vote toggle behavior.
- Collect concrete verification evidence from lint, typecheck, and test runs.

## Related Code Files

- Modify: `/home/toan-huynh/Downloads/intern-community/src/app/api/votes/route.test.ts`
- Create: `/home/toan-huynh/Downloads/intern-community/src/lib/rate-limit.test.ts`

## Implementation Steps

1. Run validation commands relevant to touched code:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
2. Expand route tests to cover:
   - `401` unauthenticated
   - `400` invalid `moduleId`
   - `429` rate limit exceeded
   - `503` storage not initialized
   - vote / un-vote happy paths
3. Add helper tests to cover:
   - success path below limit
   - rate-limit exceeded path
   - default `retryAfter` fallback
   - missing-table error mapping
   - rethrow of unrelated errors
4. Review coverage output for the new files and confirm critical paths are fully covered.

## Todo List

- [x] Run full repo lint
- [x] Run typecheck
- [x] Run test suite
- [x] Add route tests for new API behavior
- [x] Add helper tests for limiter logic
- [x] Review coverage for touched files

## Success Criteria

- Verification evidence exists, not just claimed correctness.
- Route behavior is covered for both happy path and error path.
- Helper logic is covered for success, failure, and fallback cases.
- Coverage for the newly added rate-limit files is effectively complete.

## Execution Notes

- `pnpm lint` passed after cleaning up unrelated pre-existing repo lint issues.
- `pnpm typecheck` passed.
- `pnpm test` passed.
- Added route tests for `401`, `400`, `429`, `503`, and vote/un-vote success paths.
- Added unit tests covering all branches in `src/lib/rate-limit.ts`.
- Coverage reached `100%` for:
  - `src/app/api/votes/route.ts`
  - `src/lib/rate-limit.ts`
- `pnpm build` fails on `next/font` fetching `Geist` from Google Fonts. This is unrelated to the rate-limiter change.
- No DB-backed integration test was executed in this session.

## Risk Assessment

- If no concurrency-focused test exists, reviewer may doubt correctness.
- Current tests mock the limiter at the route boundary, so advisory lock and SQL window logic are still verified by design reasoning rather than end-to-end execution.
- DB-backed concurrency is still not proven by an end-to-end test against a live PostgreSQL instance in this session.

## Security Considerations

- No security regression in auth flow.
- Ensure rate-limit errors do not leak stack traces or SQL details.

## Next Steps

- Add one DB-backed integration test for the limiter when a stable local test database workflow exists.
- Keep cleanup strategy under review if `rate_limit_events` grows too fast.
