# Goal: Implement Sandboxed Iframe Preview cho Module Detail

Vì hai task `Leaderboard` và `Notification` đều đã có người làm, chúng ta cần chọn một task vừa có tính cạnh tranh cao, vừa chưa có ai đụng đến. Qua kiểm tra GitHub Pull Requests của repository, issue **"[hard] Sandboxed iframe preview on module detail page"** vẫn còn trống! 

Đây là một issue rất tuyệt vời để ghi điểm vì:
- Nó đào sâu về vấn đề **Security (Web Security, XSS, Clickjacking, CSP)**, kỹ năng mà rất ít Interns có.
- Trải nghiệm UI/UX tinh tế (Hiển thị loading skeleton, xử lý error state của iframe).
- Yêu cầu khả năng biện luận `sandbox` attributes (sẽ dùng để viết trong file PR Template).

## User Review Required

> [!IMPORTANT]
> - Yêu cầu ghi rõ ràng: không sử dụng `allow-same-origin` + `allow-scripts` kết hợp mà không có lý do. Vậy chúng ta sẽ chỉ cấu hình `sandbox="allow-scripts"` để đảm bảo an toàn tuyệt đối nhất và trình duyệt sẽ cô lập iframe vào một "opaque origin", ngăn không cho script của Demo can thiệp vào Cookies hay LocalStorage của ứng dụng chúng ta. Bạn có đồng ý với phương án siết chặt bảo mật này không?

## Proposed Changes

---

### Component UI & Security Implementation 
Chỉnh sửa trực tiếp file hiển thị thông tin bài viết để nhúng một iframe có bảo mật cao.

#### [MODIFY] [src/app/modules/[slug]/page.tsx](file:///u:/IT_Language/intern/intern-community/src/app/modules/[slug]/page.tsx)
- Giới hạn URL an toàn: Kiểm tra `module.demoUrl.startsWith("https://")` để loại bỏ các tấn công sử dụng giao thức `javascript:` hoặc giao thức lạ.
- Tạo một Client Component nhỏ gọn: `SandboxPreview` thay cho đoạn comment Placeholder.
- **Loading Skeleton**: Tạo một `div` hiển thị vòng quay loading hoặc skeleton lấp lánh (sử dụng Tailwind class `animate-pulse`), và chỉ ẩn đi khi sự kiện `onLoad` của Iframe kích hoạt.
- **Error State**: Nếu Iframe không phản hồi hoặc gọi sự kiện `onError`, hiển thị thông báo "Failed to load preview".
- Định nghĩa **Sandbox Attributes**: Gán `sandbox="allow-scripts allow-popups"` (cho phép script chạy bên trong demo, và mở link external nếu demo yêu cầu), nhưng TUYỆT ĐỐI không dùng `allow-same-origin` để bảo vệ Session của ứng dụng chính.
- Định nghĩa Header **CSP (Content-Security-Policy)**: Cấu hình Header an toàn (Thực tế trang bị thẻ `<meta http-equiv="Content-Security-Policy">` vào `<Head>` hoặc add header phía server qua `next.config.ts`) để chặn form action và parent navigation từ iframe. Tuy nhiên ở Next.js 15 app router, set CSP header linh hoạt thì xử lý qua `next.config.ts` hoặc Middleware là cách tốt nhất, nhưng trong framework challenge, ta tập trung vào UI Iframe Component là đủ.

---

### Mảnh ghép tạo Component (Nâng cao tính tái sử dụng)

#### [NEW] [src/components/sandbox-preview.tsx](file:///u:/IT_Language/intern/intern-community/src/components/sandbox-preview.tsx)
Thay vì code toàn bộ logic state trong trang `page.tsx`, do Next.js `page.tsx` thường đang là Server Component (`async function`), việc tách iframe (có sự kiện `onLoad`) thành một Client Component sẽ tối ưu hiệu suất và đúng chuẩn Server/Client boundary. Component nhận prop: `url: string`. 

## Open Questions

> [!TIP]
> 1. Next.js App Router (Page components) đang thiết lập mặc định không có `next.config.ts` thiết lập CSP chi tiết. Tôi dự định chỉ can thiệp ở HTML `iframe` attributes và mô tả trong PR là cách tốt cho Frontend Intern, thay vì sửa cả file `next.config.ts`. Bạn có thấy cần thiết phải add script CSP vào `next.config.ts` không?
> 2. Bạn đã chuẩn bị API Token hoặc Github Access ở local để chạy Next.js Auth thử xem `iframe` khi render chèn các link demo chưa?

## Verification Plan

### Automated Tests
- Kiểm tra lại Typescript strictness của Prisma component property: `pnpm typecheck`
- Linter: `pnpm lint`

### Manual Verification
1. Mở code sửa trực tiếp một bài đăng `APPROVED` thêm giá trị URL mẫu hợp lệ (Ví dụ: `https://example.com`) vào trường `demoUrl` trong DB.
2. Truy cập trang chi tiết bài đăng (ví dụ `/modules/test-demo`).
3. Đảm bảo skeleton Loading Placeholder xuất hiện trước khi iframe thực sự tải xong.
4. Inspect F12 Element để đảm bảo `sandbox` property được gắn và không có `allow-same-origin`.
