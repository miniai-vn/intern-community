# 📋 Trạng thái 10 bài test — Intern Community Hub

> Ngày bắt đầu: 2026-04-07
> Deadline: 48 giờ từ lúc nhận tin nhắn HR

---

## 🔵 Easy — 6 bài

### ✅ E1 — Hoàn thành
**File:** `src/components/vote-button.tsx:45`
**Nhiệm vụ:** Thêm loading state (spinner icon) cho nút vote khi đang xử lý API
**Thay đổi trên web:**
- Khi click vote → icon tam giác chuyển thành **icon xoay tròn**
- Nút mờ đi (opacity-50) để user biết đang chờ
**Trạng thái:** ✅ Xong

---

### ✅ E2 — Hoàn thành
**File:** `src/components/submit-form.tsx:63`
**Nhiệm vụ:** Thêm live character counter cho textarea mô tả (giới hạn 500 ký tự, cảnh báo khi ≥450)
**Thay đổi trên web:**
- Bên dưới textarea "Description" hiện: `0 / 500`
- Khi gõ ≥450 ký tự → chuyển màu đỏ cảnh báo
- Khi gõ ≥500 ký tự → không gõ thêm được
**Trạng thái:** ✅ Xong

---

### ✅ E3 — Hoàn thành
**File:** `__tests__/utils.test.ts:25–33`
**Nhiệm vụ:** Viết 4 test case cho hàm `generateSlug`
**Đã viết:**
1. Tên đã là slug hợp lệ (không cần thay đổi)
2. Tên có số (số được giữ nguyên)
3. Chuỗi rỗng
4. Tên có dấu / ký tự đặc biệt ở đầu/cuối
**Trạng thái:** ✅ Xong — `pnpm test`: 11 passed ✅

---

### ✅ E4 — Hoàn thành
**File:** `__tests__/utils.test.ts:52–55`
**Nhiệm vụ:** Viết 2 test case cho hàm `makeUniqueSlug`
**Đã viết:**
1. Khi đã có nhiều phiên bản (my-app, my-app-1...my-app-5) → phải ra my-app-6
2. Khi có slug tương tự nhưng không trùng (["my-app-tool"]) → vẫn dùng "my-app"
**Trạng thái:** ✅ Xong — `pnpm test`: 13 passed ✅

---

### ✅ E5 — Hoàn thành
**File:** `__tests__/utils.test.ts:62`
**Nhiệm vụ:** Viết full test suite cho hàm `formatRelativeTime`
**Đã viết:**
1. < 1 phút: "just now"
2. 1–59 phút: "30m ago"
3. 1–23 giờ: "7h ago"
4. 1–29 ngày: "7d ago"
5. ≥ 30 ngày: date string (không có "ago")
**Trạng thái:** ✅ Xong — `pnpm test`: 18 passed ✅

---

### ✅ E6 — Hoàn thành
**File:** `src/components/module-card.tsx:20`
**Nhiệm vụ:** Thêm `aria-label` cho icon external link (nút mở link bên ngoài)
**Thay đổi trên web:**
- Icon 🔗 ở góc card module có `aria-label="Open demo in new tab"`
- Screen reader đọc được nút này cho người khuyết tật
**Trạng thái:** ✅ Xong

---

## 🟡 Medium — 2 bài

### ✅ M1 — Hoàn thành
**File:** `src/app/page.tsx` + `src/components/category-filter.tsx` (mới)
**Nhiệm vụ:** Implement category filter với URL persistence (không reload trang, URL thay đổi)
**Thay đổi trên web:**
- Click category pill → URL thay đổi (vd: `/?category=game`) nhưng KHÔNG reload trang
- Refresh trang → vẫn giữ nguyên filter (nhờ URL)
- Nút "All" để xóa filter
**Trạng thái:** ✅ Xong — `pnpm typecheck` ✅ `pnpm test` ✅

---

### ✅ M2 — Hoàn thành
**File:** `src/app/api/votes/route.ts`
**Nhiệm vụ:** Thay rate limiter in-memory bằng Sliding Window Rate Limiter
**Thay đổi:**
- Thuật toán mới: sliding window thay vì fixed window
- Đúng 10 vote mỗi 60 giây — chính xác hơn
- Không cần Redis — vẫn in-memory nhưng tốt hơn
**Trạng thái:** ✅ Xong — `pnpm typecheck` ✅ `pnpm test` ✅

---

## 🔴 Hard — 1 bài

### ✅ H1 — Hoàn thành
**File:** `src/app/modules/[slug]/page.tsx` + `src/components/iframe-preview.tsx` (mới)
**Nhiệm vụ:** Implement sandboxed iframe preview cho module
**Thay đổi trên web:**
- Trang chi tiết module có iframe hiển thị demo
- Iframe có `sandbox="allow-scripts allow-same-origin"`
- Có loading skeleton khi đang load
- Thông báo preview đã sandboxed vì lý do bảo mật
**Trạng thái:** ✅ Xong — `pnpm typecheck` ✅ `pnpm test` ✅

---

## 📊 Tổng kết

| Trạng thái | Số bài | Chi tiết |
|---|---|---|
| ✅ Hoàn thành | 9 / 9 | E1, E2, E3, E4, E5, E6, M1, M2, H1 |
| ⬜ Chưa làm | 0 / 9 | — |

---

## 🧪 Test trên web — Nhìn thấy vs Không nhìn thấy

### ✅ NHÌN THẤY trên web (4 bài + 3 features)

| Bài | Trang | Cách test |
|---|---|---|
| **E2** | `/submit` | Gõ vào Description → thấy `0 / 500` bên dưới. Gõ ≥450 → chuyển **đỏ** |
| **M1** | `/` | Click "Game" → URL thay đổi (`/?category=game`) nhưng trang **không reload**. Refresh → filter **vẫn giữ** |
| **H1** | `/modules/2048-game` | Thấy **iframe preview** hiển thị bên dưới |
| **Toast** | `/submit` | Submit thành công → thấy toast **"✅ Module submitted successfully!"** góc dưới phải |
| **Confirm Dialog** | `/my-submissions` | Click 🗑️ → thấy dialog hỏi **"Delete Submission?"** |
| **Skeleton** | `/` | F5 (refresh) → thấy 6 ô **loading skeleton** trước khi data hiện |

---

### ⚠️ NHÌN THẤY NHƯNG KHÓ

| Bài | Trang | Cách test |
|---|---|---|
| **E1** | `/` | Click vote → icon tam giác chuyển thành **xoay tròn** (rất nhanh, có thể bỏ qua) |

---

### ❌ KHÔNG NHÌN THẤY trên web

| Bài | Lý do | Cách test |
|---|---|---|
| **E3, E4, E5** | Chỉ là unit test | Chạy `pnpm test` → thấy **18 passed** |
| **E6** | Accessibility (aria-label) — chỉ dùng cho screen reader | F12 → Inspect icon ↗ → tìm `aria-label="Open demo in new tab"` |
| **M2** | Backend code (API rate limiter) | Click vote 11 lần → thấy **429** trong Console |

---

## ✅ Test tổng hợp

Chạy lệnh này để xác nhận tất cả:

```bash
pnpm typecheck   # ✅ Không lỗi TypeScript
pnpm test        # ✅ 18 passed
pnpm build       # ✅ Build thành công
```

---

## 🚀 Bước tiếp theo — Tạo Pull Request

1. Fork repo: https://github.com/miniai-vn/intern-community
2. Push code lên fork
3. Tạo Pull Request với mô tả đầy đủ

---

## ✨ Cải tiến thêm (ngoài 9 bài test)

### 🎉 FEATURE 1 — Toast Notification
**File:** `src/components/toast-provider.tsx` + `src/app/layout.tsx` + `src/components/submit-form.tsx`
**Nhiệm vụ:** Thêm thông báo toast khi submit thành công/thất bại
**Thay đổi trên web:**
- Submit thành công → hiện toast "✅ Module submitted successfully!"
- Submit thất bại → hiện toast "❌ Submission failed"
- Toast tự động biến mất sau 4 giây
**Trạng thái:** ✅ Xong

### 🗑️ FEATURE 2 — Confirmation Dialog khi xóa
**File:** `src/components/confirm-dialog.tsx` + `src/components/my-submissions-list.tsx` + `src/app/my-submissions/page.tsx`
**Nhiệm vụ:** Thêm bước xác nhận trước khi xóa submission
**Thay đổi trên web:**
- Click icon 🗑️ → hiện dialog hỏi "Xóa submission này?"
- Có nút "Cancel" và "Delete"
- Tránh xóa nhầm
**Trạng thái:** ✅ Xong

### 📦 FEATURE 3 — Skeleton Loading cho trang chủ
**File:** `src/components/skeleton-cards.tsx` + `src/components/module-grid.tsx` + `src/app/page.tsx`
**Nhiệm vụ:** Thêm skeleton loading khi đang load modules
**Thay đổi trên web:**
- Trang chủ load → thấy 6 ô skeleton (thay vì trắng tinh)
- Skeleton có animation pulse
- UX tốt hơn khi đợi data
**Trạng thái:** ✅ Xong

---

## ✅ Tổng kết cuối cùng

| Danh mục | Số lượng | Chi tiết |
|---|---|---|
| ✅ 9 bài test bắt buộc | 9 / 9 | E1-E6, M1, M2, H1 |
| ✨ 3 cải tiến thêm | 3 / 3 | Toast, Confirm Dialog, Skeleton |
| Tổng cộng | 12 | |

---

## 🧪 Test trên web — Nhìn thấy vs Không nhìn thấy