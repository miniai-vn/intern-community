# Hướng dẫn chạy và làm bài test — Intern Community Hub

> Dự án: https://github.com/miniai-vn/intern-community
> Thời hạn: 48 giờ kể từ lúc nhận được tin nhắn

---

## 1. Tổng quan dự án

Dự án là một **nền tảng marketplace** (Next.js 16 full-stack), nơi intern submit các module mini-app để được admin duyệt và hiển thị công khai. Cấu trúc:

```
src/app/         ← Trang web (React) + API routes chung 1 codebase
prisma/          ← Schema database
__tests__/       ← Test files (Vitest)
```

**Tech stack:**
- Next.js 16 (App Router) — cả frontend lẫn backend
- PostgreSQL (Prisma ORM)
- NextAuth v5 (GitHub OAuth)
- Tailwind CSS v4
- Vitest (testing)
- pnpm (package manager)

---

## 2. Cách chạy dự án local

### 2.1. Cài dependencies

```bash
cd "d:\bai test cong ty\intern-community"
pnpm install
```

### 2.2. Copy file env và điền thông tin

```bash
cp .env.example .env
```

Mở file `.env`, điền các biến:

```
DATABASE_URL="postgresql://td_user:td_password@localhost:5432/td_community"
AUTH_SECRET="random-32-char-string-here"
AUTH_GITHUB_ID="your-github-oauth-app-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-client-secret"
```

### 2.3. Chạy PostgreSQL (dùng Docker)

```bash
docker compose up -d
```

**Nếu máy không có Docker**, dùng PostgreSQL đã cài sẵn trên máy:
- Tạo database `td_community`
- Sửa `DATABASE_URL` trong `.env` cho đúng

### 2.4. Setup database

```bash
pnpm db:generate   # Tạo Prisma client
pnpm db:push       # Tạo bảng trong database
pnpm db:seed       # (Tuỳ chọn) Tạo dữ liệu demo
```

### 2.5. Tạo GitHub OAuth App (để login)

1. Vào GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Điền:
   - Application name: `Intern Community`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy **Client ID** và **Client Secret** vào file `.env`

### 2.6. Chạy dev server

```bash
pnpm dev
```

Mở trình duyệt: **http://localhost:3000**

---

## 3. Các lệnh test/build quan trọng

```bash
pnpm dev          # Chạy dev server (http://localhost:3000)
pnpm build        # Build production
pnpm lint         # ESLint
pnpm typecheck    # TypeScript compiler
pnpm test         # Chạy test (Vitest)
pnpm test:watch   # Chạy test ở chế độ watch
pnpm test:coverage# Chạy test với coverage report
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema lên database
pnpm db:seed      # Seed dữ liệu demo
```

---

## 4. Các bài test cần làm

Dự án có **10 challenges** chia 3 cấp độ, nằm rải rác trong các file. Đánh dấu `[easy]` / `[medium]` / `[hard]` ở comment trong code.

### 4.1. Easy (6 bài) — Nên bắt đầu từ đây

| # | File | Nhiệm vụ |
|---|---|---|
| E1 | `src/components/vote-button.tsx:45` | Thêm loading state visual cho vote button (biến `isLoading` đã có sẵn nhưng chưa dùng) |
| E2 | `src/components/submit-form.tsx:63` | Thêm character counter cho textarea mô tả (500 char limit, cảnh báo khi ≥450) |
| E3 | `__tests__/utils.test.ts:25–33` | Viết 4 test case còn thiếu cho `generateSlug` |
| E4 | `__tests__/utils.test.ts:52–55` | Viết 2 test case còn thiếu cho `makeUniqueSlug` |
| E5 | `__tests__/utils.test.ts:62` | Viết full test suite cho `formatRelativeTime` |
| E6 | `src/components/module-card.tsx:20` | Thêm `aria-label` cho icon external link (accessibility) |

### 4.2. Medium (2 bài)

| # | File | Nhiệm vụ |
|---|---|---|
| M1 | `src/app/page.tsx:5` | Implement category filter với `useRouter`/`useSearchParams` (không reload trang, URL persistence) |
| M2 | `src/app/api/votes/route.ts:7` | Thay rate limiter in-memory bằng Redis/sliding-window |

### 4.3. Hard (1 bài)

| # | File | Nhiệm vụ |
|---|---|---|
| H1 | `src/app/modules/[slug]/page.tsx:82–88` | Implement sandboxed iframe preview với security headers |

---

## 5. Cách làm bài (từng bước)

### Bước 1: Fork repo trên GitHub

Vào https://github.com/miniai-vn/intern-community → Fork về tài khoản của bạn.

### Bước 2: Clone về máy

```bash
git clone https://github.com/<your-username>/intern-community.git
cd intern-community
```

### Bước 3: Tạo branch mới cho bài làm

```bash
git checkout -b feature/<tên-bài-bạn-chọn>
# Ví dụ:
git checkout -b feature/e2-character-counter
```

### Bước 4: Chạy dự án và verify

Làm theo phần **2. Cách chạy dự án local** ở trên, đảm bảo:
- `pnpm dev` chạy được
- `pnpm test` pass
- `pnpm typecheck` không lỗi

### Bước 5: Chọn bài và làm

- Đọc kỹ code liên quan trước khi sửa
- Viết test cho functions mới/chưa test
- Kiểm tra lại bằng `pnpm test` và `pnpm typecheck`

### Bước 6: Commit và push

```bash
git add .
git commit -m "feat: add character counter to submit form"
git push origin feature/<tên-branch>
```

### Bước 7: Tạo Pull Request

1. Vào repo trên GitHub → **New Pull Request**
2. Chọn branch của bạn → **Create Pull Request**
3. Điền mô tả theo mẫu:

```markdown
## Mục tiêu
Mô tả bài bạn giải quyết cái gì, tại sao chọn bài này.

## Cách triển khai
Mô tả thay đổi code: thêm gì, sửa gì, tại sao.

## Cách kiểm thử
- Test case nào đã viết / chạy
- Kết quả `pnpm test` và `pnpm typecheck`
- Manual test (nếu có UI thay đổi)

## AI hỗ trợ
(Nếu có) Dùng AI (Copilot, Claude...) ở bước nào, kiểm chứng ra sao.
```

---

## 6. Lưu ý quan trọng

- **CI phải pass** — PR chỉ được merge khi `lint → typecheck → test → build` đều xanh
- **Đọc code trước khi sửa** — test file có TODOs bắt buộc phải đọc implementation, không được viết test mò
- **Không sửa nhiều thứ cùng lúc** — 1 PR nên tập trung 1 bài test, dễ review
- **Kiểm chứng kết quả** — nếu dùng AI, phải tự verify output trước khi commit
- **Đặt câu hỏi** — nếu challenge không rõ ràng (ví dụ category filter multi-select hay single-select), hỏi lại recruiter

---

## 7. Cấu trúc file quan trọng

```
intern-community/
├── src/app/              ← Tất cả trang (frontend + API)
│   ├── page.tsx          ← Trang chủ (browse module)
│   ├── submit/page.tsx   ← Form submit
│   ├── admin/page.tsx   ← Panel admin
│   ├── modules/[slug]/page.tsx  ← Chi tiết module (hard challenge ở đây)
│   └── api/              ← API routes
│       ├── modules/route.ts
│       ├── modules/[id]/route.ts
│       └── votes/route.ts
├── src/components/       ← React components (4 bài easy ở đây)
├── src/lib/              ← Utils, auth, validation
├── __tests__/            ← Test files (3 bài easy + 1 bài hard liên quan)
├── prisma/schema.prisma  ← Database schema
└── .env.example          ← Template biến môi trường
```

---

## 8. Checklist trước khi nộp PR

- [ ] `pnpm dev` chạy được
- [ ] `pnpm lint` pass (exit 0)
- [ ] `pnpm typecheck` pass (exit 0)
- [ ] `pnpm test` pass (exit 0)
- [ ] PR mô tả rõ: mục tiêu, cách triển khai, kiểm thử
- [ ] Code clean, không debug/log thừa
- [ ] Branch đã push lên GitHub

---

Chúc bạn làm bài tốt! Nếu gặp lỗi gì, gửi error message cụ thể, tôi sẽ hỗ trợ.