# Pull Request: [hard] Sandboxed iframe preview on module detail page

Kính gửi anh Khải và team engineering CTCP Mini Ai,

Đây là Pull Request của tôi ứng tuyển cho vị trí TTS Kỹ sư phần mềm. Dưới đây là báo cáo phản hồi theo cấu trúc bài test yêu cầu:

## 1. Mục tiêu muốn giải quyết
Tôi lựa chọn issue **`[hard] Sandboxed iframe preview on module detail page`** trong repository. 

**Mục tiêu:** Xây dựng chức năng xem trước ứng dụng (live preview) thông qua thẻ `iframe` cho trang chi tiết MiniApp. Do các liên kết demo (demoUrl) được sinh ra từ dữ liệu đầu vào của người dùng (User Generated Content), việc nhúng trực tiếp tạo ra rủi ro bảo mật đặc biệt nghiêm trọng (XSS, Clickjacking, Session Hijacking). Vì vậy, tôi đặt mục tiêu tạo ra môi trường đóng hộp (sandbox) tuyệt đối an toàn, đan xen với việc hoàn thiện trải nghiệm UX mượt mà (Skeleton loading & Error handling).

## 2. Cách triển khai
- **Tách Component (Client/Server Boundary):** Next.js App Router render trang `/modules/[slug]/page.tsx` ở Server (Server Component). Tôi chủ động tách phần hiển thị `iframe` và các event listener (`onLoad`, `onError`) thành một Client Component tên là `SandboxPreview` riêng để tối ưu hiệu suất và chuẩn hóa Data Fetching.
- **Biện luận ra quyết định Bảo Mật 🛡️:**
  - **Kiểm soát cổng vào (Validation Guard):** Chỉ cho phép tiền tố `https://`, chủ động chặn đứng hiển thị nếu đầu vào là `javascript:`, `data:`, `blob:` hoặc giao thức hỗn hợp `http://`.
  - **Quy tắc Sandbox:** Tôi cấu hình `sandbox="allow-scripts allow-popups allow-forms"`. Đặc biệt, tôi **cố tình loại bỏ thuộc tính `allow-same-origin`**. Quyết định này tước bỏ quyền và đẩy iframe giả lập vào một "opaque origin". Ngay cả khi mã độc khai thác được vào trang Demo, script đó vĩnh viễn không thể "vượt ngục" để trích xuất Cookie, Session hay LocalStorage của web app hiện tại.
- **Nâng cấp Vi Trải Nghiệm (Micro-UX):** Tích hợp hiệu ứng `animate-pulse` của Tailwind làm bộ khung Placeholder Skeleton che lấp khoảng thời gian chờ Iframe tải dữ liệu xuyên cross-domain. Nếu kết nối bị trình duyệt từ chối hoặc sập thẻ, một Error State thân thiện kèm nút link ẩn danh chuyển hướng sẽ xuất hiện.
- **Policy diện rộng (CSP Headers):** Can thiệp `next.config.ts`, định nghĩa header HTTP `Content-Security-Policy: frame-ancestors 'self'` cùng `X-Frame-Options: SAMEORIGIN` để khóa hoàn toàn khả năng Web nội bộ của hệ thống bị kẻ xấu biến thành một Iframe nhúng vào web lừa đảo.

## 3. Cách kiểm thử
Hệ thống sử dụng `Vitest`. Để minh chứng sản phẩm an toàn và đáng tin cậy:
- **Test bảo mật Component:** Viết mới tập tin `__tests__/sandbox-preview.test.ts` để kiểm định thuần túy (Pure validation) tập quy tắc Validation Guard, đánh giá qua 13 test case XSS và URL injection.
- **Bonus Track (Hoàn thiện mã nguồn gốc):** Tôi quyết định lấy thêm điểm chất lượng bằng cách viết toàn bộ Test Cases bị bỏ trống (`// TODO`) trong file `__tests__/utils.test.ts` (một Issue dễ chưa ai làm). Áp dụng `vi.useFakeTimers()` khống chế thời gian giả lập tính năng `formatRelativeTime()`.
- **Kết quả CI cục bộ:** 
  - `pnpm vitest`: Đạt Pass **33 / 33 tests**.
  - `pnpm lint`: Đạt 0 warnings, 0 errors. (Bao gồm việc tôi tự phát hiện và chủ động refactor biến `module` cũ trong `page.tsx` nhằm xoá lỗi `@next/next/no-assign-module-variable` vốn đã có từ code base).

## 4. Tôi đã dùng AI như thế nào trong quá trình thực hiện?
Thay vì dùng AI làm code prompt thụ động (tab-autocomplete), tôi dùng AI Agent đóng vai trò như một **Chuyên gia Pair-Programming và Reviewer**:
- **Tranh luận thiết kế Kiến trúc & Security:** Khi triển khai `iframe sandbox`, tôi dùng AI để đào sâu câu hỏi: *"Sát thương bảo mật khi gộp chung allow-same-origin cùng với allow-scripts là gì?"*. Sau khi được AI minh họa kịch bản Session Hijacking, tôi có cơ sở vững chắc để xây dựng hàm `SandboxPreview.tsx` loại bỏ origin mà vẫn giữ Scripts hoạt động trơn tru.
- **Tăng tốc Automated Testing:** Các Unit tests của Vitest mang tính lặp lại (boilerplate) cao, tôi ủy quyền AI rà quét file `utils.ts`, sinh tự động các unit test còn khuyết thiếu và config test environment (mock date/time), giúp tôi tiết kiệm 70% thời gian gõ code test thủ công. Mục tiêu của tôi chỉ còn là review logic assertion cuối.
- **Chữa Linter thông minh:** Khi Next.js 15 chọc ra lỗi biến "module", AI tiến hành rà soát file path trên toàn workspace, và refactor biến `module -> miniApp` trên diện rộng, giúp source tree của PR sạch lỗi một cách hoàn hảo trước khi tôi Submit Pull Request này.
