## What does this PR do?

This PR completes the **Medium** difficulty challenges for the Intern Community Hub. The focus was on improving scalability through cursor-based pagination, enhancing security with database-backed rate limiting, and providing users with better control over their submissions.

## Related Issues

Resolves the following challenges from `ISSUES.md`:

- `[medium]` Implement category filter with URL query params
- `[medium]` Add cursor-based pagination to module listing
- `[medium]` Build "My Submissions" status page (with deletion)
- `[medium]` Add rate limiting to `POST /api/votes`

## Implementation Details

### 1. Advanced Discovery (Pagination & Filtering)
- **Hybrid Pagination:** Combines Next.js Server Components for initial fast load with a Client Component (`ModuleList`) for seamless "Load More" functionality.
- **Stable Ordering:** Uses `voteCount` DESC and `id` DESC to prevent item duplication or skipping during concurrent data updates.

### 2. Submission Lifecycle
- **Author Control:** Added a safe deletion flow for `PENDING` submissions, allowing users to retract mistakes.
- **State Revalidation:** Uses `router.refresh()` to ensure the UI stays synchronized with the database without full page reloads.

### 3. Distributed Rate Limiting
- **Persistent Storage:** Migrated rate limiting to a `RateLimitEvent` table in PostgreSQL, making the system resilient to server restarts and horizontally scalable across multiple instances.
- **Sliding Window:** Implements a sliding window check (10 votes/min) with background cleanup of expired events.

## How to test

1. **Discovery:** Go to the home page, select multiple categories, and search. Use the "Load More" button to see more modules. Verify that state persists in the URL.
2. **Deletion:** Submit a test module, go to "My Submissions", and delete it. Confirm the status remains correct for non-pending items.
3. **Rate Limit:** Click the upvote button rapidly (11+ times). After the 10th click, you should receive a `429` error.

## Checklist

- [x] I implemented cursor-based pagination using composite stable ordering
- [x] I moved rate limiting from in-memory to a persistent Database-backed sliding window
- [x] I added a confirmation flow and state revalidation for submission deletion
- [x] I ensured all filters persist in URL query parameters correctly
- [x] I ran `pnpm lint` and `pnpm typecheck` — no errors

## Notes for reviewer

- **Trap Handling:** Preserved the `MiniApp` vs `Module` terminology drift and `N+1` query guards as requested in the project guidelines.
- **DB Push Required:** New table `RateLimitEvent` added. Please run `npx prisma db push` before testing.
