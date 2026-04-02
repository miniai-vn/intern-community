# Intern Community Hub

> An open platform for the TD developer community to submit and discover mini-app modules — and an open-source hiring challenge for aspiring interns.

[![CI](https://github.com/your-org/intern-community/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/intern-community/actions/workflows/ci.yml)

---

## What is this?

**Intern Community Hub** is a web platform where developers can:
- Browse approved mini-app modules built by the community
- Submit their own mini-apps for review
- Upvote modules they find useful
- (Admins) Review and approve/reject submissions

This repo also doubles as an **open-source internship challenge**. Instead of a theory-only interview, candidates demonstrate their skills by contributing real PRs to this real codebase.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Styling | Tailwind CSS |
| Testing | Vitest |
| Local DB | Docker Compose |
| CI | GitHub Actions |

---

## Local setup

**Prerequisites:** Node.js 20+, pnpm, Docker

```bash
# 1. Clone
git clone https://github.com/your-org/intern-community.git
cd intern-community

# 2. Install dependencies
pnpm install

# 3. Copy env
cp .env.example .env
# Edit .env — add your GitHub OAuth credentials
# (see "GitHub OAuth setup" below)

# 4. Start the database
docker compose up -d

# 5. Apply schema and seed demo data
pnpm db:push
pnpm db:seed

# 6. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### GitHub OAuth setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - **Application name:** Intern Community Hub (local)
   - **Homepage URL:** `http://localhost:3000`
   - **Callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Secret into your `.env`

---

## Available scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Run tests
pnpm db:push      # Apply schema to DB (dev, no migration file)
pnpm db:migrate   # Create and apply a named migration
pnpm db:seed      # Seed demo data
pnpm db:studio    # Open Prisma Studio
```

---

## Intern Challenge — How to contribute

> See [open issues](https://github.com/your-org/intern-community/issues?q=label%3Aintern-challenge+is%3Aopen) for available tasks.

### Workflow

```
1. Fork this repo
2. Pick an open issue tagged `intern-challenge`
3. Comment "I'm working on this" on the issue
4. Create a branch: feat/issue-{number}-short-description
5. Write your code, commit using Conventional Commits
6. Open a PR — fill in the PR template completely
7. A maintainer will leave 1-2 review comments
8. Respond to feedback and revise if needed
9. Strong PRs → invited to a short follow-up chat
```

### Challenge levels (you guys can pick the issue here or can just bring any updates/feature you want to the project)

| Level | Tag | Description | Est. time |
|---|---|---|---|
| 🟢 Easy | `difficulty: easy` | Fix a bug, add validation, write tests | 1–3 h |
| 🟡 Medium | `difficulty: medium` | Add a feature (API endpoint or UI component) | 4–8 h |
| 🔴 Hard | `difficulty: hard` | Design and implement a complete module | 1–3 days |

### What we look for in PRs

| Criteria | How we observe it |
|---|---|
| Reads code before writing | PR is consistent with existing patterns |
| Uses AI responsibly | Code is specific, not boilerplate; can explain every line |
| Technical reasoning | Commit messages, structure, edge cases handled |
| Communication | PR description quality, asks clarifying questions on vague issues |
| Speed + quality balance | Feels considered, not rushed |

**Transparency note:** We may ask "why did you choose this approach?" in a review comment. We want to distinguish candidates who understand their code from those who don't.

---

## Project structure

```
src/
├── app/              # Next.js App Router pages + API routes
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Prisma client, auth config, utils, validations
└── types/            # Shared TypeScript types
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Demo data seeder
__tests__/            # Vitest tests
.github/              # CI workflow + issue/PR templates
```

---

## Naming note

`MiniApp` in the database, `Module` in the UI — this naming drift is intentional (mirrors real-world legacy systems). **Do not rename** one to match the other without an issue discussion first.

---

## License

MIT
