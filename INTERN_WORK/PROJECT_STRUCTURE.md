# 📁 Cấu trúc dự án — Chi tiết từng file

> Dành cho người mới. Giải thích: file đó **làm gì**, **nằm ở đâu trong luồng**, và **frontend hay backend**.

---

## 🔑 Hiểu đơn giản về cấu trúc

Dự án này dùng **Next.js** — một framework đặc biệt: **frontend và backend nằm chung 1 codebase**.

| Thuật ngữ | Giải thích |
|---|---|
| **Frontend** | Giao diện web — HTML, CSS, React components. Nằm trong `src/app/` |
| **Backend** | Xử lý dữ liệu — API routes đọc/ghi database. Cũng nằm trong `src/app/api/` |
| **Database** | Lưu trữ dữ liệu — PostgreSQL, quản lý qua Prisma, nằm trong `prisma/` |

```
Dự án này (Next.js)
├── src/app/           ← FRONTEND (giao diện) + BACKEND API (xử lý dữ liệu)
├── src/components/   ← FRONTEND (các mảnh giao diện dùng lại được)
├── src/hooks/        ← FRONTEND (logic React dùng lại được)
├── src/lib/          ← SHARED (cả frontend và backend đều dùng)
├── src/types/        ← SHARED (định nghĩa kiểu dữ liệu)
├── prisma/           ← BACKEND (schema database)
└── __tests__/        ← TEST (kiểm tra code)
```

---

## 🗂️ Từng file giải thích

---

### 📄 Root — File cấu hình gốc

| File | Làm gì |
|---|---|
| `package.json` | Khai báo danh sách thư viện cần cài (Next.js, Prisma, Tailwind...) + các lệnh chạy (`pnpm dev`, `pnpm test`...) |
| `tsconfig.json` | Cấu hình TypeScript — bật strict mode, đặt alias `@/*` = `./src/*` để import ngắn gọn |
| `next.config.ts` | Cấu hình Next.js — hiện đang trống, chưa tùy chỉnh gì |
| `eslint.config.mjs` | Cấu hình ESLint — kiểm tra code style, bắt lỗi convention |
| `vitest.config.ts` | Cấu hình Vitest — runner chạy test |
| `postcss.config.mjs` | Cấu hình PostCSS — dùng cho Tailwind CSS v4 |
| `prisma.config.ts` | Cấu hình Prisma v6 — file này thay thế phần `datasource` trong `schema.prisma` |
| `docker-compose.yml` | Cấu hình Docker — tạo container PostgreSQL để chạy database local |
| `.env.example` | Template file biến môi trường — copy sang `.env` rồi điền thật |
| `pnpm-lock.yaml` | File lock — ghi lại phiên bản chính xác của từng thư viện đã cài |
| `AGENTS.md` | Ghi chú cho AI agent — cảnh báo Next.js version |
| `PLAN.md` | Tài liệu thiết kế kiến trúc — có cả "bẫy" cố ý để test ứng viên |
| `ISSUES.md` | Danh sách challenge issues trên GitHub |
| `CONTRIBUTING.md` | Hướng dẫn đóng góp cho intern |
| `README.md` | Giới thiệu dự án (trang chủ của repo GitHub) |

---

### 📁 `prisma/` — Database (Backend)

Đây là **Backend thuần** — không liên quan đến giao diện.

#### `prisma/schema.prisma`
**Làm gì:** Định nghĩa toàn bộ **cấu trúc database** — có những bảng nào, bảng nào liên quan bảng nào.

**Các bảng (model):**

```
Account      — Lưu thông tin tài khoản OAuth (GitHub login)
Session      — Lưu phiên đăng nhập của user
VerificationToken — Lưu token xác thực email
User         — Thông tin user (tên, email, avatar, có phải admin không)
Category     — Danh mục module (Game, Finance, Productivity...)
MiniApp      — Module do user submit (tên, mô tả, link GitHub, trạng thái duyệt...)
Vote         — Ai vote module nào (để không vote trùng)
```

**Mối quan hệ giữa các bảng:**

```
User 1──→ Account   (1 user có nhiều tài khoản OAuth)
User 1──→ Session   (1 user có nhiều phiên đăng nhập)
User 1──→ MiniApp   (1 user submit nhiều module)
User 1──→ Vote      (1 user vote nhiều module)
MiniApp 1──→ Category (mỗi module thuộc 1 danh mục)
MiniApp 1──→ Vote    (mỗi module có nhiều vote)
```

#### `prisma/seed.ts`
**Làm gì:** Tạo **dữ liệu mẫu** để test — 5 danh mục, 1 admin, 1 contributor, 3 module đã duyệt, 2 module đang chờ.

**Chạy:** `pnpm db:seed`

---

### 📁 `src/lib/` — Thư viện dùng chung (Shared)

Thư mục này chứa code **cả frontend và backend đều dùng**.

#### `src/lib/db.ts`
**Làm gì:** Tạo **1 kết nối Prisma duy nhất** (singleton), dùng chung cho toàn bộ app.

**Tại sao cần singleton?**
- Mỗi lần hot-reload trong dev mode, Next.js tạo module mới
- Nếu không dùng global cache, sẽ tạo quá nhiều kết nối database → crash
- Singleton đảm bảo chỉ có **1 kết nối** dù hot-reload bao nhiêu lần

```ts
// Cấu trúc: global cache → dùng lại client cũ, không tạo mới
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const db = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

#### `src/lib/auth.ts`
**Làm gì:** Cấu hình **NextAuth v5** — đăng nhập bằng GitHub OAuth.

**Luồng hoạt động:**
```
User click "Sign in with GitHub"
  → NextAuth chuyển sang GitHub
  → GitHub hỏi user có cho phép không
  → GitHub redirect về /api/auth/callback/github
  → NextAuth tạo Session + lưu vào database
  → User đã đăng nhập thành công
```

**Các function được export:**
- `handlers` — dùng cho route `/api/auth/[...nextauth]/route.ts`
- `auth()` — lấy thông tin user hiện tại (dùng trong Server Components/API)
- `signIn()` / `signOut()` — dùng trong Client Components

#### `src/lib/validations.ts`
**Làm gì:** Định nghĩa **quy tắc kiểm tra dữ liệu** dùng Zod (thư viện validation).

**Hai schema chính:**

```ts
// submitModuleSchema — kiểm tra form submit module
{
  name: string (3-60 ký tự)
  description: string (20-500 ký tự)
  categoryId: string (phải là CUID hợp lệ)
  repoUrl: string (phải là URL bắt đầu bằng https://github.com/)
  demoUrl: string (optional, phải là URL hợp lệ)
}

// adminReviewSchema — kiểm tra form duyệt/bác bỏ
{
  status: "APPROVED" | "REJECTED"
  feedback: string (tối đa 500 ký tự, optional)
}
```

**Tại sao cần validation?**
- User có thể gửi dữ liệu sai/bằng curl, Postman
- Validation đảm bảo dữ liệu đúng format trước khi lưu database

#### `src/lib/utils.ts`
**Làm gì:** Các **hàm tiện ích** nhỏ, dùng ở nhiều nơi.

```ts
cn()             // Gộp className CSS (dùng với Tailwind)
generateSlug()   // Tạo URL slug từ tên: "My App!" → "my-app"
makeUniqueSlug() // Thêm số nếu trùng: "my-app-1", "my-app-2"...
formatRelativeTime() // Đổi ngày thành "5m ago", "2h ago"...
```

---

### 📁 `src/types/` — Định nghĩa kiểu dữ liệu (Shared)

#### `src/types/index.ts`
**Làm gì:** Tạo **type Module** — ghép dữ liệu từ nhiều bảng database lại thành 1 object thống nhất.

```ts
// Module = MiniApp (DB) + category + author + voteCount
export type Module = MiniApp & {
  category: Category;           // thêm thông tin danh mục
  author: Pick<User, ...>;      // thêm thông tin người viết
  _count?: { votes: number };  // đếm số vote (optional)
  hasVoted?: boolean;          // user hiện tại đã vote chưa
};
```

---

### 📁 `src/hooks/` — Logic React dùng lại (Frontend)

#### `src/hooks/use-optimistic-vote.ts`
**Làm gì:** Quản lý trạng thái **nút vote** — cập nhật UI ngay lập tức (optimistic) trước khi server phản hồi.

**Luồng hoạt động:**

```
User click vote
  1. UI tự tăng count + đổi màu NGAY (optimistic update)
  2. Gửi request lên server
  3. Server OK → giữ nguyên
  4. Server lỗi → rollback về state cũ
```

**Các state trả về:**
```ts
voted       // đã vote chưa (true/false)
count       // số vote hiện tại
isLoading   // đang chờ server phản hồi không
toggle()    // function gọi khi click
```

---

### 📁 `src/components/` — Giao diện (Frontend)

Đây là **Frontend thuần** — chỉ render HTML, không xử lý data trực tiếp.

#### `src/components/navbar.tsx`
**Làm gì:** Thanh navigation ở **đầu mỗi trang**.

**Hiển thị khác nhau theo trạng thái đăng nhập:**

```
Chưa đăng nhập:  [Intern Community Hub]              [Sign in with GitHub]
Đã đăng nhập:   [Intern Community Hub] [Submit] [My Sub] [Admin?] [Sign out] [Name]
```

#### `src/components/session-provider.tsx`
**Làm gì:** Wrapper cho NextAuth `SessionProvider` — giúp các component con đọc được thông tin đăng nhập.

#### `src/components/module-card.tsx`
**Làm gì:** **Một ô module** trong lưới trang chủ.

**Trông như thế này:**
```
┌────────────────────────────────────┐
│ [Tên Module]              [🔗]    │  ← link demo (icon)
│ Mô tả ngắn 2 dòng...              │
│                                    │
│ [Category]              [▲ 41]    │  ← VoteButton
└────────────────────────────────────┘
```

#### `src/components/vote-button.tsx`
**Làm gì:** **Nút vote** — hiển thị số vote + icon tam giác.

**Trạng thái:**
```
Chưa vote:    ▲ 41  (nền xám)
Đã vote:      ▲ 41  (nền cam)
Chưa login:   ▲ 41  (chữ xám, không click được)
```

#### `src/components/submit-form.tsx`
**Làm gì:** **Form submit module mới** — có 5 trường.

**Các trường:**
```
1. Module name    — text, 3-60 ký tự
2. Description    — textarea, 20-500 ký tự
3. Category       — dropdown chọn danh mục
4. GitHub URL     — bắt buộc, phải là github.com
5. Demo URL       — optional
```

**Sau khi submit thành công** → chuyển sang `/my-submissions`

#### `src/components/admin-review-card.tsx`
**Làm gì:** **Một ô duyệt module** trong trang admin.

**Trông như thế này:**
```
┌────────────────────────────────────┐
│ Tên Module · by Người viết         │
│ Mô tả...                           │
│ [GitHub →] [Demo →]                │
│ [Feedback textarea]                 │
│ [  Approve  ]    [  Reject  ]       │
└────────────────────────────────────┘
```

---

### 📁 `src/app/` — Trang web + API routes

Đây là thư mục quan trọng nhất. Mỗi file/folder con = **một trang web** hoặc **một API endpoint**.

---

#### `src/app/layout.tsx` — Layout gốc
**Làm gì:** Khung HTML bao quanh **tất cả mọi trang**.

```
<html>
  <head> (font Geist, metadata)
  <body>
    <AuthSessionProvider>    ← cho phép đọc thông tin login
      <Navbar />            ← thanh menu trên cùng
        <main>
          {children}        ← NỘI DUNG TRANG (thay đổi theo từng trang)
        </main>
      </Navbar>
    </AuthSessionProvider>
  </body>
</html>
```

**Mọi trang đều có:** Navbar + nội dung riêng

---

#### `src/app/page.tsx` — Trang chủ `/`
**Làm gì:** Trang **browse/danh sách module** công khai.

**Luồng hoạt động:**
```
1. Lấy user hiện tại (session)
2. Query database: lấy các module APPROVED
3. Lọc theo category nếu có (?category=game)
4. Lọc theo search nếu có (?q=pomodoro)
5. Lấy danh sách user đã vote
6. Render: ô tìm kiếm + danh mục + lưới ModuleCard
```

---

#### `src/app/submit/page.tsx` — Trang submit `/submit`
**Làm gì:** Trang **tạo module mới**.

**Luồng:**
```
1. Kiểm tra đã login chưa → chưa thì redirect sang login
2. Lấy danh sách categories từ database
3. Render <SubmitForm /> với categories
```

**Không ai được vào trang này nếu chưa đăng nhập.**

---

#### `src/app/my-submissions/page.tsx` — Trang của tôi `/my-submissions`
**Làm gì:** Xem **các module mình đã submit** + trạng thái duyệt.

**Hiển thị mỗi submission gồm:**
```
[Tên module]                    [PENDING/APPROVED/REJECTED]
Category · ngày submit
(Feedback từ admin nếu có)
```

---

#### `src/app/admin/page.tsx` — Trang admin `/admin`
**Làm gì:** Panel **duyệt/bác bỏ** module của community.

**Chỉ admin mới vào được** — user thường redirect về trang chủ.

**Hai phần:**
```
Pending (đang chờ duyệt):
  [AdminReviewCard] [AdminReviewCard] ...

Recently Reviewed (đã duyệt gần đây):
  [Tên: APPROVED] [Tên: REJECTED] ...
```

---

#### `src/app/modules/[slug]/page.tsx` — Chi tiết module `/modules/tên-slug`
**Làm gì:** Trang **chi tiết 1 module** — xem mô tả đầy đủ, vote, xem demo.

**Ví dụ:** `/modules/pomodoro-timer`

**Có 3 phần:**
```
← Back                         ← nút quay lại
[Tên Module]           [▲ Vote]
by Người viết · Category
Mô tả đầy đủ...

[View on GitHub] [Live Demo]  ← 2 nút link

[Sandbox iframe preview]      ← TODO: hard challenge
```

---

### 📁 `src/app/api/` — Backend API routes

Mỗi file trong đây = **một endpoint** để code gửi request lên.

---

#### `src/app/api/auth/[...nextauth]/route.ts`
**Làm gì:** Endpoint xử lý **đăng nhập/đăng xuất** của NextAuth.

**Không cần sửa file này** — chỉ export handlers từ auth.ts.

---

#### `src/app/api/modules/route.ts` — API `/api/modules`

| Method | Làm gì |
|---|---|
| `GET` | Lấy danh sách module đã duyệt (có pagination, filter) |
| `POST` | Tạo module mới (cần đăng nhập) |

**GET luồng:**
```
Request:  GET /api/modules?category=game&q=pomodoro&cursor=abc
Response: { items: [...], nextCursor: "xyz" }
```

**POST luồng:**
```
Request:  POST /api/modules
Body:    { name, description, categoryId, repoUrl, demoUrl }
↓
1. Validate dữ liệu bằng Zod
2. Tạo slug từ tên (generateSlug)
3. Kiểm tra slug đã tồn tại chưa (makeUniqueSlug)
4. Lưu vào database với status = PENDING
Response: { module object } + status 201
```

---

#### `src/app/api/modules/[id]/route.ts` — API `/api/modules/[id]`

| Method | Ai được gọi | Làm gì |
|---|---|---|
| `GET` | Ai cũng được | Lấy chi tiết 1 module |
| `PATCH` | Chỉ admin | Duyệt (APPROVED) hoặc bác (REJECTED) |
| `DELETE` | Chủ module hoặc admin | Xóa module |

**PATCH luồng:**
```
Request:  PATCH /api/modules/abc123
Body:    { status: "APPROVED", feedback: "Nice work!" }
↓
1. Kiểm tra admin
2. Validate dữ liệu
3. Cập nhật status + feedback
Response: { updated module }
```

---

#### `src/app/api/votes/route.ts` — API `/api/votes`

| Method | Ai được gọi | Làm gì |
|---|---|---|
| `POST` | Chỉ user đã login | Toggle vote (vote → unvote, unvote → vote) |

**POST luồng:**
```
User click vote button
  ↓
Kiểm tra rate limit (tối đa 10 vote/phút)
  ↓
Kiểm tra đã vote chưa?
  ↓ Đã vote → Xóa vote → giảm voteCount
  ↓ Chưa vote → Tạo vote → tăng voteCount
  ↓
Response: { voted: true/false }
```

---

### 📁 `__tests__/` — Test files

#### `__tests__/utils.test.ts`
**Làm gì:** Test các hàm trong `src/lib/utils.ts`.

**Cấu trúc test:**

```
generateSlug         — 4 test có sẵn + 4 test cần viết (TODO)
makeUniqueSlug       — 3 test có sẵn + 2 test cần viết (TODO)
formatRelativeTime    — CHƯA CÓ TEST nào, cần viết full (TODO)
```

**Chạy test:**
```bash
pnpm test:watch   # chạy liên tục, auto re-run khi sửa code
pnpm test         # chạy 1 lần
pnpm test:coverage# chạy + xem % coverage
```

---

## 🔄 Luồng dữ liệu tổng hợp

### Luồng 1: User submit module mới

```
/submit/page.tsx  (Frontend - Server Component)
  ├─ kiểm tra login
  ├─ lấy categories
  └─ render <SubmitForm /> (Client Component)

submit-form.tsx   (Frontend - Client Component)
  ├─ user điền form
  ├─ gửi POST /api/modules
  │
api/modules/route.ts  (Backend API)
  ├─ validate bằng Zod
  ├─ tạo slug
  ├─ lưu database (status=PENDING)
  └─ return 201

submit-form.tsx
  ├─ nhận response OK
  └─ router.push("/my-submissions")
```

### Luồng 2: Admin duyệt module

```
/admin/page.tsx   (Frontend - Server Component)
  ├─ kiểm tra isAdmin
  ├─ lấy pending modules
  └─ render <AdminReviewCard />

admin-review-card.tsx  (Client Component)
  ├─ user click Approve
  ├─ gửi PATCH /api/modules/[id]
  │
api/modules/[id]/route.ts  (Backend API)
  ├─ kiểm tra isAdmin
  ├─ cập nhật status = APPROVED
  └─ return 200

admin-review-card.tsx
  └─ router.refresh() → re-render danh sách
```

### Luồng 3: Vote module

```
VoteButton.tsx  (Frontend - Client Component)
  ├─ user click
  ├─ gọi useOptimisticVote.toggle()
  │
use-optimistic-vote.ts  (Frontend - Hook)
  ├─ setVoted(!voted)    ← UI cập nhật NGAY
  ├─ setCount(±1)
  ├─ gửi POST /api/votes
  │
api/votes/route.ts  (Backend API)
  ├─ kiểm tra login
  ├─ kiểm tra rate limit
  ├─ toggle vote trong database
  └─ return { voted: true/false }

use-optimistic-vote.ts
  ├─ success → giữ nguyên
  └─ error → rollback về state cũ
```

---

## 📊 Tóm tắt: File nào thuộc phần nào

| File | Frontend | Backend | Shared |
|---|---|---|---|
| `src/components/*.tsx` | ✅ | | |
| `src/hooks/*.ts` | ✅ | | |
| `src/app/page.tsx` | ✅ | | |
| `src/app/submit/page.tsx` | ✅ | | |
| `src/app/my-submissions/page.tsx` | ✅ | | |
| `src/app/admin/page.tsx` | ✅ | | |
| `src/app/modules/[slug]/page.tsx` | ✅ | | |
| `src/app/api/modules/route.ts` | | ✅ | |
| `src/app/api/modules/[id]/route.ts` | | ✅ | |
| `src/app/api/votes/route.ts` | | ✅ | |
| `src/app/api/auth/[...nextauth]/route.ts` | | ✅ | |
| `src/app/layout.tsx` | ✅ | | |
| `src/lib/db.ts` | | | ✅ |
| `src/lib/auth.ts` | | | ✅ |
| `src/lib/validations.ts` | | | ✅ |
| `src/lib/utils.ts` | | | ✅ |
| `src/types/index.ts` | | | ✅ |
| `prisma/schema.prisma` | | ✅ | |
| `prisma/seed.ts` | | ✅ | |
| `__tests__/utils.test.ts` | Test | | |

---

## 🧠 Bạn cần nhớ

1. **Frontend** = `src/app/` (trang) + `src/components/` (mảnh giao diện)
2. **Backend** = `src/app/api/` (xử lý data) + `prisma/` (database)
3. **Shared** = `src/lib/` (dùng chung cả hai)
4. Muốn thêm/trang → tạo folder mới trong `src/app/`
5. Muốn thêm API → tạo file mới trong `src/app/api/`
6. Muốn thêm giao diện → tạo component trong `src/components/`
7. Muốn thêm bảng database → sửa `prisma/schema.prisma` rồi chạy `pnpm db:push`
