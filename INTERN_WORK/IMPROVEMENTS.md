# 💡 Đề xuất cải tiến dự án — Theo cấp độ bài test intern

> File này liệt kê các tính năng/nâng cấp mà dự án **đANG THIẾU**, chia theo 3 mức độ. Đây là những thứ bạn có thể làm thêm **ngoài các bài test đã có** trong codebase.

---

## 🔵 Mức độ Easy — Những thứ nhỏ nhưng có giá trị

### 1. Thêm Skeleton Loading cho trang chủ
**File:** `src/app/page.tsx`

**Vấn đề:** Khi load dữ liệu từ database, trang chỉ hiển thị trắng hoặc loading mặc định của trình duyệt.

**Cần làm:**
```tsx
// Hiện 6 ô skeleton giống ModuleCard trong khi đang load
// Dùng CSS animation pulse
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ████████ │  │ ████████ │  │ ████████ │
│ ████████ │  │ ████████ │  │ ████████ │
│ ████████ │  │ ████████ │  │ ████████ │
└──────────┘  └──────────┘  └──────────┘
```

### 2. Empty state đẹp hơn cho My Submissions
**File:** `src/app/my-submissions/page.tsx`

**Vấn đề:** Trang "No submissions yet" hiện tại hơi đơn giản.

**Cần làm:**
- Thêm icon SVG phù hợp (ví dụ: clipboard hoặc folder trống)
- Thêm animation nhẹ (fade-in)
- Nút "Submit your first module" nổi bật hơn

### 3. Toast notification khi submit thành công
**File:** `src/components/submit-form.tsx`

**Vấn đề:** Sau khi submit thành công, user chỉ được chuyển sang trang mới — không có thông báo "Đã submit thành công".

**Cần làm:**
```tsx
// Sau khi submit OK, hiện toast:
✅ Module đã được gửi! Đang chờ admin duyệt.
```
Có thể dùng thư viện nhẹ hoặc tự viết CSS-only toast.

### 4. Error boundary cho từng section
**File:** `src/app/page.tsx`

**Vấn đề:** Nếu category list hoặc module grid bị lỗi, cả trang sẽ crash.

**Cần làm:**
```tsx
// Bọc từng phần trong ErrorBoundary riêng
<ErrorBoundary name="ModuleGrid">
  <ModuleCard ... />
</ErrorBoundary>

<ErrorBoundary name="CategoryFilter">
  {categories.map(...)}
</ErrorBoundary>
```

### 5. Confirmation dialog khi delete module
**File:** `src/app/api/modules/[id]/route.ts` hoặc `AdminReviewCard`

**Vấn đề:** User click delete → xóa ngay → không có bước xác nhận.

**Cần làm:**
```tsx
// Hiện dialog trước khi xóa:
❓ "Bạn có chắc muốn xóa module này không? Hành động này không thể hoàn tác."
   [Hủy]  [Xóa]
```

### 6. Debounce ô tìm kiếm
**File:** `src/app/page.tsx`

**Vấn đề:** Khi gõ vào ô search, mỗi ký tự đều trigger search ngay → gây spam request.

**Cần làm:**
- Thêm debounce 300-500ms trước khi gửi search request
- Hoặc dùng form submit thuần (hiện tại đã là form → không cần làm thêm)

### 7. Hiển thị số kết quả tìm kiếm
**File:** `src/app/page.tsx`

**Vấn đề:** User search xong không biết có bao nhiêu kết quả.

**Cần làm:**
```
Kết quả: "Tìm thấy 3 modules phù hợp với 'pomodoro'"
```

### 8. Tooltip cho nút vote
**File:** `src/components/vote-button.tsx`

**Vấn đề:** Không biết vote để làm gì.

**Cần làm:**
- Thêm tooltip khi hover: "Upvote để giúp module này nổi bật hơn"
- Khi đã vote: "Bỏ vote"

---

## 🟡 Mức độ Medium — Tính năng có ý nghĩa hơn

### 1. Phân trang cho trang chủ
**File:** `src/app/page.tsx`

**Vấn đề:** Hiện tại chỉ `take: 12` — nếu có 100 module thì sao?

**Cần làm:**
```tsx
// Thêm nút "Xem thêm" hoặc số trang
┌────────────────────────────────┐
│ [Module] [Module] [Module]     │
│ [Module] [Module] [Module]     │
│ [Module] [Module] [Module]     │
│ [Module] [Module] [Module]     │
│                                │
│ [← Prev]  Trang 1 / 5  [Next →]│
└────────────────────────────────┘
```

### 2. Infinite scroll thay vì phân trang
**File:** `src/app/page.tsx`

**Vấn đề:** Phân trang cổ điển hơi chậm — infinite scroll mượt hơn.

**Cần làm:**
- Khi cuộn đến cuối danh sách → tự động load thêm
- Dùng Intersection Observer API

### 3. Search với debounce + loading indicator
**File:** `src/app/page.tsx`

**Cần làm:**
```
Khi đang gõ:  [🔍 Tìm kiếm...]  ← có icon loading
Khi xong:     [🔍 Tìm kiếm...]  ← mất loading
```

### 4. Toast notification hệ thống
**File:** `src/app/layout.tsx` hoặc `src/components/toast.tsx`

**Vấn đề:** Hiện tại không có feedback cho user khi xảy ra lỗi (ngoại trừ form error).

**Cần làm:**
```tsx
// 3 loại toast:
✅ Thành công:  "Module đã được duyệt!"
⚠️ Cảnh báo:   "Bạn cần đăng nhập để vote"
❌ Lỗi:        "Đã xảy ra lỗi. Vui lòng thử lại."
```
Hiện ở góc trên phải, tự động ẩn sau 3-5 giây.

### 5. Admin thêm/sửa/xóa danh mục (Category CRUD)
**File:** `src/app/admin/page.tsx` + `src/app/api/categories/route.ts`

**Vấn đề:** Danh mục hiện tại cố định (5 cái), không có cách nào thêm mới qua UI.

**Cần làm:**
```tsx
// Trang admin, thêm phần:
🏷️ Quản lý danh mục
┌─────────────────────────────────┐
│ [+] Thêm danh mục mới           │
│ Game        [✏️] [🗑️]          │
│ Finance     [✏️] [🗑️]          │
│ Productivity[✏️] [🗑️]          │
└─────────────────────────────────┘
```

### 6. User profile page
**File:** `src/app/profile/[id]/page.tsx` + `src/app/api/users/[id]/route.ts`

**Vấn đề:** Không có trang cá nhân để xem ai đã submit những module nào.

**Cần làm:**
```
/profile/abc123
┌──────────────────────────────┐
│ 🧑 DoVietHoang2802           │
│ 📧 doviet...@gmail.com       │
│ 📅 Tham gia: 01/03/2026      │
│ 📦 3 modules đã submit      │
│ ❤️ 85 votes nhận được        │
└──────────────────────────────┘
```

### 7. Module star rating (thay vì chỉ upvote)
**File:** `src/components/rating.tsx` + `src/app/api/modules/[id]/route.ts`

**Vấn đề:** Chỉ có upvote (like), không có đánh giá sao (1-5 ★).

**Cần làm:**
```tsx
// Thay VoteButton bằng RatingStars
★ ★ ★ ★ ☆   ← click để đánh giá
   4.2/5 (23 ratings)
```

### 8. Module comments/reviews
**File:** `src/components/comment-form.tsx` + `src/app/api/comments/route.ts` + `prisma/schema.prisma`

**Vấn đề:** Không có nơi để community bình luận/feedback về module.

**Cần làm:**
```
💬 Bình luận (12)
┌──────────────────────────────────┐
│ @user1 · 2h trước                 │
│ Rất hữu ích! Cảm ơn bạn!         │
│ [👍 5] [💬 Reply]                │
├──────────────────────────────────┤
│ @user2 · 5h trước               │
│ Có thể thêm tính năng export...  │
└──────────────────────────────────┘
[Viết bình luận...]
```

### 9. Dark mode
**File:** `src/app/globals.css` + `src/components/theme-toggle.tsx`

**Vấn đề:** Chỉ có light mode.

**Cần làm:**
```tsx
// Thêm toggle ở Navbar
🌙 Dark Mode toggle
```
Dùng CSS variables cho màu sắc, lưu preference trong localStorage.

### 10. Sitemap + SEO metadata cho từng module
**File:** `src/app/sitemap.ts` + `src/app/robots.ts`

**Vấn đề:** Không có sitemap → Google khó index.

**Cần làm:**
- Tạo sitemap cho các trang `/`, `/modules/[slug]`
- Thêm meta description cho từng module

---

## 🔴 Mức độ Hard — Tính năng lớn, có ý nghĩa kinh doanh

### 1. Sandbox iframe preview (đã là hard challenge có sẵn)
**File:** `src/app/modules/[slug]/page.tsx`

**Yêu cầu:**
- Chỉ hiện iframe khi có demoUrl
- `sandbox="allow-scripts allow-same-origin"`
- Content-Security-Policy header riêng cho iframe origin
- Loading skeleton + error fallback

### 2. Real-time notification (email/push khi module được duyệt)
**File:** `src/app/api/modules/[id]/route.ts` + email service

**Vấn đề:** User submit xong không biết khi nào được duyệt — phải tự vào kiểm tra.

**Cần làm:**
```
Khi admin approve/reject:
  → Gửi email cho user: "Module của bạn đã được duyệt!"
  → Hoặc hiện notification trong app (badge trên My Submissions)
```

### 3. Admin dashboard với thống kê
**File:** `src/app/admin/page.tsx`

**Vấn đề:** Admin panel hiện tại chỉ là danh sách — không có số liệu tổng quan.

**Cần làm:**
```tsx
// Thêm overview ở đầu trang admin:
📊 Tổng quan
┌──────────┬──────────┬──────────┬──────────┐
│  12     │  8       │  45      │  120     │
│ Modules │ Pending  │ Votes    │ Users    │
│ đã duyệt│ chờ duyệt│ hôm nay  │ đăng ký  │
└──────────┴──────────┴──────────┴──────────┘
```

### 4. Full-text search với Elasticsearch/Meilisearch
**File:** `src/app/api/modules/route.ts`

**Vấn đề:** Search hiện tại chỉ tìm `contains` đơn giản — không tìm được theo nghĩa, không highlight kết quả.

**Cần làm:**
```
Tìm "pomodoro focus timer"
  → Tìm được: "Pomodoro Timer" (dù description không chứa "timer")
  → Highlight: "**Pomodoro** **Timer**"
  → Gợi ý: "Bạn có muốn tìm: Pomodoro Timer?"
```

### 5. Authentication nâng cao (2FA, magic link)
**File:** `src/lib/auth.ts`

**Vấn đề:** Chỉ có GitHub OAuth — không có 2FA cho admin.

**Cần làm:**
- Thêm email/password login
- Thêm 2FA cho admin
- Magic link login qua email

### 6. Module versioning
**File:** `prisma/schema.prisma` + `src/app/modules/[slug]/page.tsx`

**Vấn đề:** Khi submitter cập nhật repo, module trên web vẫn giữ nguyên.

**Cần làm:**
```
// Thêm bảng ModuleVersion trong schema
MiniApp
  └── ModuleVersion (id, miniAppId, version, repoUrl, changelog, createdAt)

Trang chi tiết module:
  v1.2.3 — 15/03/2026
  [Changelog]
  - Added dark mode
  - Fixed bug...
```

### 7. Featured/pinned modules
**File:** `prisma/schema.prisma` + `src/app/page.tsx`

**Vấn đề:** Tất cả module xếp chung — không có cách highlight module nổi bật.

**Cần làm:**
```prisma
model MiniApp {
  // Thêm field:
  isFeatured Boolean @default(false)
  featuredAt  DateTime?
}
```
Hiện module featured ở đầu trang với design khác biệt.

### 8. Social sharing
**File:** `src/app/modules/[slug]/page.tsx`

**Vấn đề:** Không có nút chia sẻ lên mạng xã hội.

**Cần làm:**
```tsx
// Thêm ở trang chi tiết module:
 Chia sẻ:
 [Twitter/X] [Facebook] [LinkedIn] [Copy Link]
```

### 9. PWA (Progressive Web App)
**File:** `src/app/` (manifest, service worker)

**Vấn đề:** Không cài được app về điện thoại như một ứng dụng thật sự.

**Cần làm:**
```json
// manifest.json
{
  "name": "Intern Community Hub",
  "short_name": "InternHub",
  "display": "standalone",
  "icons": [...]
}

// Service Worker:
// - Offline support
// - Push notification
// - Install prompt
```

### 10. Export data (CSV/JSON)
**File:** `src/app/api/modules/route.ts`

**Vấn đề:** Không có cách export danh sách module.

**Cần làm:**
```
/api/modules?format=csv
/api/modules?format=json
```
Dành cho admin hoặc phân tích dữ liệu.

---

## 🎯 Gợi ý chọn bài làm

| Nếu bạn muốn... | Hãy chọn... |
|---|---|
| Làm nhanh, dễ pass CI | E1 Skeleton loading, E3 Toast notification |
| Học cách xử lý UX | E5 Confirmation dialog, E8 Tooltip |
| Trội hơn các ứng viên khác | M4 Toast notification (nếu chưa ai làm), M7 Star rating |
| Thể hiện năng lực backend | M5 Category CRUD, M8 Comments |
| Chứng minh full-stack | H3 Admin dashboard thống kê, H4 Elasticsearch search |
| Làm impact thật sự | H2 Email notification khi duyệt module |

---

## ⚠️ Lưu ý quan trọng

1. **Chỉ chọn 1-2 bài vừa đủ** — làm quá nhiều PR sẽ bị loại
2. **Ưu tiên các bài easy đã có sẵn trong code** — đó là các bài được thiết kế để intern làm, không nên bỏ qua
3. **Nếu làm bài ngoài danh sách** — phải đảm bảo CI pass + test cover
4. **Chất lượng quan trọng hơn số lượng** — 1 PR làm tốt tốt hơn 5 PR làm qua loa
