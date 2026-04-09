# Intern Challenge Issues

This file is a reference for maintainers to create GitHub issues.
Copy each section into a new issue using the matching issue template.

---

## 🟢 Easy Issues
"I'm working on this"
### [easy] Fix: vote button shows no loading state

**Template:** intern-challenge-easy  
**Files:** `src/components/vote-button.tsx`, `src/hooks/use-optimistic-vote.ts`

**Task description:**  
The vote button (`src/components/vote-button.tsx`) triggers an API call when clicked, but doesn't show any visual feedback while the request is in progress. Users can't tell if their click registered.

There is a `// TODO` comment in `vote-button.tsx` marking exactly where this needs to be addressed.

**Acceptance criteria:**
- While `isLoading` is `true`, the button shows a visual loading indicator (spinner, pulsing opacity, or similar)
- The indicator disappears once the vote resolves (success or error)
- The existing `disabled` state is preserved
- No new dependencies introduced

**Hints:**
- `isLoading` is already returned by `useOptimisticVote` — you just need to use it in the UI
- A simple CSS approach (e.g. `animate-pulse` or a spinner SVG) is fine
- Look at how `isSubmitting` is handled in `submit-form.tsx` for inspiration

**Notes for reviewer:**
- Check that the loading state is accessible (not just color-based)
- Ask: "Why did you choose this specific visual treatment?"

---

### [easy] Add character counter to description textarea
"I'm working on this"
**Template:** intern-challenge-easy  
**Files:** `src/components/submit-form.tsx`

**Task description:**  
The description field in the submit form (`submit-form.tsx`) has a 500-character limit, but users can't see how many characters they've used. There is a `// TODO` comment in the file marking this location.

**Acceptance criteria:**
- A live counter updates as the user types (e.g. `"243 / 500"`)
- Counter turns red (or similar warning color) when near/at the limit (e.g. ≥ 450 chars)
- Works without JavaScript disabled being a concern (client-side only is fine)
- No layout shift when the counter appears

**Hints:**
- The `SubmitForm` component is already a client component (`"use client"`)
- You'll need local state for the current character count
- The `Field` helper component in the same file supports a `hint` prop — you may use that or render the counter separately

**Notes for reviewer:**
- Ensure the counter is associated with the textarea (accessibility)
- Ask: "What would happen if a user pastes text exceeding 500 chars?"

---

### [easy] Write unit tests for `generateSlug`

**Template:** intern-challenge-easy  
**Files:** `__tests__/utils.test.ts`, `src/lib/utils.ts`

**Task description:**  
`__tests__/utils.test.ts` has several existing tests for `generateSlug` and `makeUniqueSlug`, but there are `// TODO` comments marking missing test cases. The `formatRelativeTime` function has no tests at all.

**Acceptance criteria:**
- All `// TODO` test cases in `generateSlug` and `makeUniqueSlug` sections are implemented
- A complete test suite for `formatRelativeTime` is written (all documented cases covered)
- All tests pass with `pnpm test`
- Tests are deterministic (no flakiness)

**Hints:**
- Read `src/lib/utils.ts` carefully before writing assertions
- For `formatRelativeTime`, you need to control time — use `vi.useFakeTimers()` and `vi.setSystemTime()`
- See [Vitest fake timers docs](https://vitest.dev/api/vi.html#vi-usefaketimers)

**Notes for reviewer:**
- Check that edge cases (empty string, boundary values) are covered
- Ask: "What does `generateSlug('')` return and why?"

---

### [easy] Add `aria-label` to icon-only buttons

**Template:** intern-challenge-easy  
**Files:** `src/components/module-card.tsx`

**Task description:**  
The module card has an external link button that renders only an SVG icon — no visible text. This is inaccessible because screen readers can't describe the button's purpose. There is a `// TODO` comment in `module-card.tsx` marking this.

**Acceptance criteria:**
- The external link anchor has a descriptive `aria-label` (e.g. `"Open demo for {module name}"`)
- `aria-hidden="true"` is present on the icon SVG (already there — verify it stays)
- No visual changes

**Hints:**
- The `module` prop is available in `ModuleCard` — use `module.name` in the label
- Check other icon-only elements in the codebase for consistency

---

## 🟡 Medium Issues

### [medium] Implement category filter with URL query params

**Template:** intern-challenge-medium  
**Files:** `src/app/page.tsx`, `src/components/` (new component likely needed)

**Task description:**  
The browse page already renders category pills that link to `/?category=slug`, but this is a plain `<a>` tag — navigating to a category does a full page reload and loses search state. The filter also doesn't support multi-select.

**Acceptance criteria:**
- Category filter uses `useRouter` / `useSearchParams` — no full page reload
- Selected category persists in the URL (survives refresh)
- Search query (`?q=`) and category filter can be active simultaneously
- Filter UI clearly indicates the active category

**Intentional ambiguity — you must ask:**  
Should the filter support selecting **multiple categories** at once? (AND or OR logic?)  
Comment on this issue asking for clarification before you implement.

**Hints:**
- `searchParams` in `page.tsx` is already read server-side — a hybrid approach (server filter + client URL update) works well
- `useSearchParams` from `next/navigation` for reading; `useRouter.push` for writing

**Notes for reviewer:**
- Verify filter state survives browser back/forward
- Ask about the ambiguity resolution: "How did you decide on single vs multi-select?"

---

### [medium] Add cursor-based pagination to module listing

**Template:** intern-challenge-medium  
**Files:** `src/app/page.tsx`, `src/app/api/modules/route.ts`

**Task description:**  
The browse page loads at most 12 modules (hardcoded `take: 12`). There's no way to see more. The API route already supports cursor-based pagination (returns `nextCursor`) but the UI doesn't use it.

**Acceptance criteria:**
- A "Load more" button appears when there are more modules
- Clicking it appends the next page to the existing list (no full page reload)
- `nextCursor` from the API is used (not offset-based)
- Loading state shown while fetching next page

**Hints:**
- The `GET /api/modules` endpoint already handles `?cursor=` — read it carefully
- You'll need to convert the page to a client component or use a hybrid pattern
- Consider: when should the "Load more" button be hidden?

---

### [medium] Build "My Submissions" status page

**Template:** intern-challenge-medium  
**Files:** `src/app/my-submissions/page.tsx`

**Task description:**  
The My Submissions page exists but is basic. It shows a list of submissions but doesn't allow the user to delete a pending submission if they change their mind.

**Acceptance criteria:**
- Users can delete their own `PENDING` submissions (with a confirmation prompt)
- `APPROVED` and `REJECTED` submissions cannot be deleted by the user (only by admin)
- After deletion, the list updates without a full page reload
- Empty state is shown when the user has no submissions

**Hints:**
- `DELETE /api/modules/[id]` already exists — read it to understand authorization
- A simple `confirm()` dialog is acceptable for the confirmation prompt
- `useRouter().refresh()` to revalidate server data after deletion

---

### [medium] Add rate limiting to `POST /api/votes`

**Template:** intern-challenge-medium  
**Files:** `src/app/api/votes/route.ts`

**Task description:**  
`POST /api/votes` has a TODO comment noting that the current in-memory rate limiter is not production-ready (resets on server restart, doesn't work in multi-process deployments).

**Acceptance criteria:**
- Replace the in-memory `Map` with a proper rate limiter
- Max 10 votes per user per 60-second window
- Returns HTTP 429 with a descriptive message when exceeded
- Works correctly across multiple server instances (use a Redis-backed solution, or document clearly why a simpler approach is acceptable for this scale)

**Hints:**
- [Upstash Rate Limit](https://github.com/upstash/ratelimit) is a common solution for serverless Next.js — it's free tier is sufficient
- Alternatively, implement a sliding window in PostgreSQL using a `rate_limit_events` table
- Either approach is acceptable — explain your trade-off in the PR

---

## 🔴 Hard Issues

### [hard] Design and implement a notification system

**Template:** intern-challenge-hard  
**Files:** New files + `src/app/api/`, `prisma/schema.prisma`

**Context:**  
When a maintainer approves or rejects a submission, the author currently has no way to know other than checking "My Submissions". We want to notify authors in-app.

**Task description:**  
Design and implement an in-app notification system that alerts module authors when their submission status changes.

**Acceptance criteria:**
- A notification is created when a `MiniApp` status changes to `APPROVED` or `REJECTED`
- Users can see unread notifications (count badge in navbar)
- Users can view all notifications and mark them as read
- Notifications persist across sessions (stored in DB)

**Constraints & non-goals:**
- No email/push notifications (in-app only)
- No real-time websockets needed (polling on page focus is acceptable)
- Notification content: "{Module name} was approved/rejected" + timestamp

**Notes for reviewer:**
- Review the proposed schema additions carefully — ask about indexing strategy
- Ask: "How would this scale to 10,000 users checking notifications simultaneously?"

---

### [hard] Build contributor leaderboard

**Template:** intern-challenge-hard  
**Files:** New page `src/app/leaderboard/page.tsx` + API route

**Context:**  
We want to reward active community contributors with visibility.

**Task description:**  
Build a leaderboard page showing the top contributors for the current calendar month, ranked by number of approved module submissions.

**Acceptance criteria:**
- `/leaderboard` page shows top 10 contributors for the current month
- Each entry shows: rank, avatar, name, number of approved submissions this month
- The page is publicly visible (no login required)
- Data is reasonably fresh (acceptable: revalidate every 10 minutes)

**Constraints:**
- Use Next.js `revalidate` (ISR) — no client-side polling
- "Current month" resets at UTC midnight on the 1st of each month

**Notes for reviewer:**
- Review the DB query — check for N+1, missing indexes
- Ask: "What happens to the leaderboard on the 1st of a new month at 00:01 UTC?"

---

### [hard] Sandboxed iframe preview on module detail page

**Template:** intern-challenge-hard  
**Files:** `src/app/modules/[slug]/page.tsx`

**Context:**  
Module authors can provide a `demoUrl`. Currently the detail page just shows a "coming soon" placeholder. We want to show a live preview.

**Task description:**  
Implement a sandboxed iframe preview of the module's demo URL on the detail page.

**Acceptance criteria:**
- Iframe renders the `demoUrl` in a sandboxed container below the module description
- Uses appropriate `sandbox` attribute (justify your attribute choices in the PR)
- Shows a loading skeleton while the iframe loads
- Shows an error state if the iframe fails to load
- Only renders if `demoUrl` is present and is an `https://` URL
- Passes a basic security review (no obvious clickjacking, no allow-list bypass)

**Constraints:**
- Do not use `allow-same-origin` + `allow-scripts` together without justification
- The hosting server must set appropriate CSP headers — document how

**Notes for reviewer:**
- Review the sandbox attribute choices carefully — this is a security feature
- Ask: "What's the risk if allow-same-origin and allow-scripts are both set?"
