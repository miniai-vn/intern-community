# TD Intern Community — Project Plan

## Context

This project is an open-source web app that doubles as a **hiring filter**.  
Instead of theory-only interviews, candidates prove their skills by contributing real PRs to a real codebase.

The app itself is the **Intern Community Hub** — a platform where developers submit mini-app/module ideas to be featured in TD's super app ecosystem. The repo IS the platform and the challenge at the same time.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (GitHub OAuth) |
| Styling | Tailwind CSS + shadcn/ui |
| Testing | Vitest |
| Local DB | Docker Compose |
| CI | GitHub Actions |
| Package manager | pnpm |

---

## App Features (what we build)

1. **Browse page** — list of approved mini-apps with search, category filter, upvote count
2. **GitHub OAuth login**
3. **Submit form** — name, description, category, repo URL, demo URL
4. **Admin panel** — review pending submissions, approve/reject with feedback message
5. **Upvoting** — authenticated users only, optimistic UI
6. **My Submissions** — user sees their own submissions + status
7. **Detail page** — `/modules/[slug]` with sandboxed iframe preview (if demo URL exists)

---

## Project Structure

```
intern-community/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── intern-challenge-easy.yml
│   │   ├── intern-challenge-medium.yml
│   │   ├── intern-challenge-hard.yml
│   │   └── bug-report.yml
│   ├── workflows/
│   │   └── ci.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── page.tsx                  # Browse/landing
│   │   │   ├── submit/page.tsx           # Submit mini-app
│   │   │   ├── modules/[slug]/page.tsx   # Detail + iframe preview
│   │   │   └── my-submissions/page.tsx   # User's own submissions
│   │   ├── admin/
│   │   │   └── page.tsx                  # Admin review panel
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── modules/route.ts          # GET list, POST create
│   │   │   ├── modules/[id]/route.ts     # GET detail, PATCH, DELETE
│   │   │   └── votes/route.ts            # POST vote (with rate limit)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                           # shadcn generated
│   │   ├── module-card.tsx
│   │   ├── submit-form.tsx
│   │   ├── admin-review-card.tsx
│   │   └── vote-button.tsx               # uses useOptimisticVote
│   ├── hooks/
│   │   └── use-optimistic-vote.ts        # ⚠️ intentional edge case (see below)
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts                         # Prisma singleton
│   │   ├── utils.ts                      # slug generation utility
│   │   └── validations.ts               # Zod schemas
│   └── types/index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── __tests__/
│   └── utils.test.ts                    # partial tests — candidates fill gaps
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── README.md
├── CONTRIBUTING.md
└── ISSUES.md                            # issue list for maintainer to create on GitHub
```

---

## Prisma Schema (key models)

```prisma
model User {
  id            String       @id @default(cuid())
  githubId      String       @unique
  name          String
  email         String?
  avatarUrl     String?
  isAdmin       Boolean      @default(false)
  submissions   MiniApp[]
  votes         Vote[]
  createdAt     DateTime     @default(now())
}

model MiniApp {
  id          String        @id @default(cuid())
  slug        String        @unique
  name        String
  description String
  category    Category      @relation(fields: [categoryId], references: [id])
  categoryId  String
  repoUrl     String
  demoUrl     String?
  status      SubmissionStatus @default(PENDING)
  feedback    String?       // admin rejection/approval message
  author      User          @relation(fields: [authorId], references: [id])
  authorId    String
  votes       Vote[]
  voteCount   Int           @default(0)  // denormalized for performance
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  modules  MiniApp[]
}

model Vote {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  module    MiniApp  @relation(fields: [moduleId], references: [id])
  moduleId  String
  createdAt DateTime @default(now())
  @@unique([userId, moduleId])
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## Intentional "Traps" for Evaluating Candidates

These are deliberate design decisions that reward candidates who actually read the code:

### 1. `MiniApp` vs `Module` naming inconsistency
- Database model: `MiniApp`  
- UI display & routes: `Module`  
- This is intentional (mirrors real-world legacy drift)  
- Good candidates keep the inconsistency consistent; they don't "fix" it without asking  
- Issues that touch both layers will reveal if they understand the mapping

### 2. `useOptimisticVote` edge case
```ts
// hooks/use-optimistic-vote.ts
// BUG: when user votes then immediately navigates away and back,
// the optimistic state is stale. A good candidate notices and asks.
// A vibe-coder will just implement the happy path.
```
The hook has a `useEffect` cleanup that looks correct but silently drops the rollback on unmount.

### 3. Prisma N+1 guard
```ts
// lib/db.ts — a query with an explicit `include` to avoid N+1
// Comment: "DO NOT simplify this query without running EXPLAIN ANALYZE first"
// Good candidates leave it alone or ask why; vibe-coders delete the include
```

### 4. One vague issue
The "Add category filter" medium issue intentionally omits whether filter should be:
- Multi-select or single-select
- AND logic or OR logic  
This tests whether candidates ask for clarification or just pick one silently.

---

## Intern Challenge Issues

### 🟢 Easy
- `[easy]` Add character counter to description textarea (max 500 chars)
- `[easy]` Fix: vote button shows no loading state during API call
- `[easy]` Write unit tests for `generateSlug()` in `lib/utils.ts`
- `[easy]` Add `aria-label` to icon-only buttons in `module-card.tsx`

### 🟡 Medium
- `[medium]` Implement category filter with URL query params (state persists on refresh)  ← **intentionally vague**
- `[medium]` Add cursor-based pagination to mini-app listing
- `[medium]` Build "My Submissions" page with submission status badges
- `[medium]` Add rate limiting to `POST /api/votes` (max 10 votes/min per user)

### 🔴 Hard
- `[hard]` Design and implement in-app notification system (submission approved/rejected)
- `[hard]` Build contributor leaderboard: top submitters of the month
- `[hard]` Implement sandboxed iframe preview on detail page with security headers

---

## GitHub Setup Files

### Issue Templates (`.github/ISSUE_TEMPLATE/`)
Each yml template has:
- `intern-challenge` label pre-applied
- Difficulty label (`easy` / `medium` / `hard`)
- Fields: task description, acceptance criteria, hints, time estimate
- A "context tip" pointing to the relevant files

### PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## What does this PR do?
<!-- Describe the change -->

## Related Issue
Closes #

## How to test
<!-- Steps for reviewer to verify -->

## Checklist
- [ ] Tests added/updated
- [ ] TypeScript types are correct
- [ ] I ran `pnpm lint` and `pnpm typecheck` locally
- [ ] I understand why I made each change (reviewer may ask)
```

### CI Workflow (`.github/workflows/ci.yml`)
Jobs: `lint` → `typecheck` → `test` → `build`  
Runs on: `pull_request` targeting `main`

---

## README Structure

1. Project overview (EN + note in VI)
2. Tech stack badge table
3. Local setup (5 steps: clone → `pnpm install` → copy `.env.example` → `docker compose up -d` → `pnpm dev`)
4. How to contribute as a candidate (fork → pick issue → PR workflow)
5. Challenge levels explained with links to open issues
6. What reviewers look for (transparent evaluation criteria)
7. Code of Conduct link

---

## CONTRIBUTING.md Structure

1. Prerequisites
2. Local setup (detailed)
3. Branch naming: `feat/issue-{number}-short-description`
4. Commit convention: Conventional Commits (`feat:`, `fix:`, `test:`, etc.)
5. PR guidelines + what to expect from review
6. "We will ask you why" — transparency about the review trap
7. Admin setup (for maintainers)

---

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: td_community_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

---

## Verification Plan

After implementation, verify:
1. `docker compose up -d` starts PostgreSQL cleanly
2. `pnpm dev` runs without errors at `localhost:3000`
3. GitHub OAuth login works (requires GitHub OAuth app credentials)
4. Submit form creates a `PENDING` record in DB
5. Admin panel shows pending submissions, approve/reject works
6. Vote button updates count optimistically and persists
7. CI workflow passes on a test PR
8. All issue templates render correctly on GitHub

---

## Implementation Order

1. Project scaffold (Next.js init, pnpm, tsconfig, Tailwind, shadcn)
2. Docker Compose + Prisma schema + seed data
3. NextAuth GitHub OAuth
4. Core API routes (modules CRUD, votes)
5. UI pages (browse, submit, detail, my-submissions, admin)
6. Hooks + components
7. Tests (`__tests__/utils.test.ts`)
8. GitHub files (.github/**, README, CONTRIBUTING, ISSUES.md)
9. Final review of traps + intentional quirks
