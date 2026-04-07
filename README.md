# 🚀 Intern Community Hub — Social & AI Enhanced

> An open platform for the TD developer community to submit and discover mini-app modules — and an open-source hiring challenge.
> **Submission for Issue #199: Social Features & AI Moderation.**

---

## 💎 Features Highlights (Issue #199)

Project này tập trung vào việc hiện đại hóa trải nghiệm người dùng bằng các tính năng Social và tích hợp Trí tuệ nhân tạo (AI):

- **💬 Phân cấp bình luận (Nested Comments)**: Trả lời lồng nhau 1 cấp, tích hợp Emoji Picker tiện lợi.
- **🛡️ Kiểm duyệt tự động (AI Moderation)**: Sử dụng hệ thống tự động kiểm soát nội dung độc hại với cơ chế Fallback thông minh (DeepSeek + Gemini).
- **⚡ Background Processing**: Xử lý logic nặng bằng Next.js `after()` API để không làm chậm trải nghiệm của User. 
- **🌗 Giao diện thông minh**: Hỗ trợ chế độ Sáng/Tối và hệ thống Thông báo (Notification Bell) thời gian thực.

👉 **Chi tiết về giải pháp kỹ thuật, cấu trúc Database và cơ chế AI, vui lòng xem tại: [SUMMARY.md](./SUMMARY.md)**

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 (Auth.js) |
| AI Engines | DeepSeek Chat API + Google Gemini API |
| Testing | Vitest |

---

## 🚀 Local Setup

**Prerequisites:** Node.js 20+, pnpm/npm, Docker

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env
cp .env.example .env
# Edit .env — add your GitHub OAuth and AI API keys (DeepSeek, Gemini)

# 3. Start the database
docker compose up -d

# 4. Apply schema and seed demo data
npx prisma db push
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

---

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages + API routes
├── components/       # Reusable React components (EmojiPicker, CommentSection, etc.)
├── hooks/            # Custom React hooks (Optimistic updates, Theme)
├── lib/              # Prisma client, AI Moderation logic, Auth config, Utils
└── types/            # Shared TypeScript types
prisma/
├── schema.prisma     # Database schema (Added Comment/Notification/ModerationLog)
└── seed.ts           # Demo data seeder
```

---

## 📝 Naming note

`MiniApp` in the database, `Module` in the UI — this naming drift is intentional (mirrors real-world legacy systems). **Do not rename** one to match the other without an issue discussion first.

---

**Submission by**: Trần Anh Đức (duc19092005)
**Date**: 7th April 2026
