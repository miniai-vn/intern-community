<h1 align="center">🚀 Module Ecosystem & PostgreSQL Migration</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

> **Mục tiêu dự án:** Thay vì sử dụng mảng tĩnh (Static Mock Data), dự án đã được chuyển đổi toàn bộ kiến trúc sang dữ liệu thực thể nhằm xây dựng một hệ thống có khả năng mở rộng. Mục tiêu chính là hoàn thiện luồng Full-stack từ Database đến UI/UX.

---

## 💻 Các tính năng đã triển khai (Features)

- **⚙️ Infrastructure:** Thiết lập PostgreSQL chạy trên Docker, quản lý Schema mạnh mẽ và an toàn với Prisma ORM.
- **🔄 Full CRUD Flow:** Hoàn thiện luồng dữ liệu thực tế: `Gửi Module` ➡️ `Lưu Database` ➡️ `Hiển thị Dashboard` ➡️ `Xem chi tiết`.
- **🌱 Seeding Data:** Xây dựng bộ `seed.ts` với 6 modules thực tế, kèm mô tả kỹ thuật chi tiết để kiểm tra độ ổn định của Layout.
- **✨ Pro UI/UX:**
  - Thiết kế **Browser Mockup Preview** cho trang chi tiết module mang lại cảm giác hiện đại.
  - Tối ưu Typography với `text-justify` (căn lề đều) giúp giao diện chuẩn chuyên nghiệp, dễ đọc.

---

## 🛠️ Những khó khăn & Cách giải quyết (Troubleshooting)

*Phần này thể hiện tư duy xử lý vấn đề và khả năng thích nghi của một Junior/Intern:*

| 🚧 Vấn đề gặp phải | 🔍 Nguyên nhân | ✅ Cách em đã giải quyết |
| :--- | :--- | :--- |
| **Lỗi Hydration (Next.js 15)** | Sai lệch HTML giữa Server và Client do Browser Extensions can thiệp. | Refactor cấu trúc Component và tối ưu hóa Render logic để đồng bộ HTML. |
| **Prisma Client Undefined** | Lỗi khởi tạo Client trong môi trường Server Components. | Khởi tạo `PrismaClient` trực tiếp tại Server-side để đảm bảo kết nối DB luôn sẵn sàng. |
| **Stale Data (Cache)** | Next.js mặc định cache dữ liệu khiến UI không tự động cập nhật sau khi Submit form. | Áp dụng `export const dynamic = 'force-dynamic'` để ép ứng dụng lấy data real-time. |

---

## 🤖 AI Pair Programming Workflow

Thay vì code theo lối mòn, em chủ động phối hợp với AI (ChatGPT/Gemini) như một **Pair Programmer** để tăng tốc độ phát triển:

- 🏗️ **Tư vấn kiến trúc:** Thiết kế tối ưu hóa quan hệ *One-to-Many* giữa Category và Module.
- ⚡ **Debug thần tốc:** Cung cấp và phân tích log lỗi từ Prisma/Docker cho AI để tìm hướng giải quyết cốt lõi thay vì tra cứu thủ công tốn thời gian.
- 📝 **Mocking Content:** Hỗ trợ viết các đoạn mô tả kỹ thuật (Technical descriptions) dài, mang tính thực tế cao để kiểm tra tính thẩm mỹ và độ co giãn của UI.

---

## 📖 Hướng dẫn khởi chạy (Setup Guide)

Để Reviewer có thể kiểm tra sản phẩm một cách nhanh chóng và chính xác nhất, vui lòng thực hiện theo các lệnh sau:

```bash
# 1. Khởi động Database (PostgreSQL) qua Docker
docker-compose up -d

# 2. Cài đặt các thư viện cần thiết
npm install

# 3. Đồng bộ Database Schema với Prisma
npx prisma db push

# 4. Khởi tạo dữ liệu mẫu (Bắt buộc để hiển thị 6 module mẫu lên giao diện)
npx prisma db seed

# 5. Chởi chạy ứng dụng
npm run dev

