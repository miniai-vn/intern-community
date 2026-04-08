# Contributing to Intern Community Hub

Thank you for your interest in contributing! This guide covers everything you need to get your first PR merged.

---

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local PostgreSQL)
- A GitHub account

---

## Local setup

```bash
git clone https://github.com/your-org/intern-community.git
cd intern-community
pnpm install
cp .env.example .env
```

Edit `.env` — you need GitHub OAuth credentials:
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. New OAuth App → Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Paste Client ID and Secret into `.env`

```bash
docker compose up -d       # Start PostgreSQL
pnpm db:push               # Apply schema
pnpm db:seed               # Load demo data
pnpm dev                   # Start dev server at localhost:3000
```

---

## Branch naming

```
feat/issue-{number}-short-description    # new feature
fix/issue-{number}-short-description     # bug fix
test/issue-{number}-short-description    # adding tests
```

Examples:
- `feat/issue-12-category-filter`
- `fix/issue-7-vote-loading-state`
- `test/issue-3-slug-generation`

---

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add category filter to browse page
fix: show loading state on vote button
test: add unit tests for generateSlug
docs: clarify setup instructions in README
refactor: extract VoteButton into its own component
```

- Keep commits small and focused
- One logical change per commit
- Write the message for your future self — explain *why*, not just *what*

---

## Before you open a PR

```bash
pnpm lint          # Must pass
pnpm typecheck     # Must pass
pnpm test          # Must pass
pnpm build         # Must pass (catches runtime import issues)
```

---

## PR guidelines

1. **Fill in the PR template completely** — especially "How to test"
2. **Keep PRs focused** — one issue per PR, no unrelated cleanup
3. **Reference the issue** — `Closes #42` in your PR description
4. **Explain your approach** — a short note on why you made the choices you did

### What happens after you open a PR

- CI runs automatically (lint, typecheck, test, build)
- A maintainer will leave **1–2 review comments** within a few days
- At least one comment may ask: *"Why did you choose this approach?"*
  - This is not a gotcha — it's how we verify understanding
  - Answer honestly; if you used AI to generate the code, that's fine, but you should be able to explain what it does
- Address feedback in new commits (don't force-push or squash during review)
- Once approved, maintainers will merge

---

## Code style & patterns

- **TypeScript** everywhere — no `any` unless unavoidable and commented
- **Tailwind** for styling — no custom CSS unless truly necessary
- **Server Components** by default; add `"use client"` only when needed (interactivity, hooks)
- **Zod** for all input validation — see `src/lib/validations.ts`
- **Prisma** for all DB access — see `src/lib/db.ts`
- Error handling at API boundaries; don't swallow errors silently

### The `MiniApp` vs `Module` naming

`MiniApp` is the Prisma model name. `Module` is the UI-facing term. **Keep both.** This is intentional — see the README for why. If you're adding a new field or component that touches both layers, match the existing pattern in the file you're editing.

---

## Admin setup (maintainers only)

To grant admin access to a user after they sign in:

```sql
UPDATE users SET is_admin = true WHERE github_id = 'their-github-id';
```

Or via Prisma Studio:
```bash
pnpm db:studio
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/intern-community/discussions) or comment on the relevant issue.
