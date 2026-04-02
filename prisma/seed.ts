import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Đang dọn dẹp và bơm siêu dữ liệu vào Postgres...");

  // 1. Reset dữ liệu cũ
  await prisma.module.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Tạo các Categories chuẩn
  const catUI = await prisma.category.create({ data: { name: "UI Components", slug: "ui" } });
  const catLogic = await prisma.category.create({ data: { name: "Logic / Hook", slug: "logic" } });
  const catTemplate = await prisma.category.create({ data: { name: "Template", slug: "template" } });

  const superModules = [
    {
      name: "Zalo Pay Integration",
      slug: "zalo-pay-integration",
      description: "Giải pháp tích hợp cổng thanh toán ZaloPay toàn diện cho ứng dụng Next.js. Module này hỗ trợ đầy đủ quy trình từ tạo đơn hàng (Create Order), xử lý Callback bảo mật từ Server đến việc hiển thị mã QR động. Được tối ưu hóa để xử lý các trường hợp mất kết nối hoặc thanh toán chờ, giúp tăng tỷ lệ chuyển đổi cho dự án E-commerce của bạn.",
      authorName: "Author 1",
      voteCount: 156,
      repoUrl: "https://github.com/khanh-dev/zalo-pay",
      categoryId: catLogic.id,
    },
    {
      name: "Glassmorphism Card Kit",
      slug: "glass-card-kit",
      description: "Bộ thư viện UI chuyên biệt về phong cách thiết kế kính mờ (Glassmorphism). Cung cấp hơn 20 mẫu Layout Card khác nhau với hiệu ứng đổ bóng đa lớp, độ mờ đục tùy chỉnh và viền gradient siêu mỏng. Toàn bộ các Component đều được xây dựng dựa trên Tailwind CSS, đảm bảo tốc độ load trang cực nhanh và khả năng tương thích hoàn hảo trên mọi thiết kế Dark Mode hiện đại.",
      authorName: "Author 2",
      voteCount: 89,
      repoUrl: "https://github.com/khanh-dev/glass-ui",
      categoryId: catUI.id,
    },
    {
      name: "E-commerce Starter Kit",
      slug: "ecommerce-starter",
      description: "Một bản Boilerplate hoàn chỉnh cho các dự án khởi nghiệp bán hàng trực tuyến. Template tích hợp sẵn hệ thống quản lý giỏ hàng (Cart logic) sử dụng Zustand, trang thanh toán tối ưu hóa trải nghiệm người dùng, và hệ thống lọc sản phẩm đa năng. Codebase được tổ chức theo kiến trúc Clean Architecture, giúp bạn dễ dàng mở rộng tính năng mà không lo ngại về vấn đề nợ kỹ thuật (Technical Debt).",
      authorName: "Author 3",
      voteCount: 230,
      repoUrl: "https://github.com/khanh-dev/shop-template",
      categoryId: catTemplate.id,
    },
    {
      name: "Framer Motion Command Palette",
      slug: "command-palette",
      description: "Nâng cấp trải nghiệm người dùng với thanh điều hướng thông minh (Command Menu) giống như trên MacOS. Sử dụng sức mạnh của Framer Motion để tạo ra các chuyển động mượt mà khi đóng mở. Hỗ trợ tìm kiếm mờ (Fuzzy Search), điều khiển hoàn toàn bằng phím tắt bàn phím và tích hợp sẵn hệ thống Accessibility giúp mọi đối tượng người dùng đều có thể thao tác dễ dàng.",
      authorName: "Author 4",
      voteCount: 120,
      repoUrl: "https://github.com/khanh-dev/cmd-k",
      categoryId: catUI.id,
    },
    {
      name: "React Hook Form + Zod",
      slug: "form-validation",
      description: "Giải pháp tối ưu nhất hiện nay cho việc xử lý các Form dữ liệu phức tạp trong React. Bằng cách kết hợp React Hook Form để tối ưu hóa hiệu năng render và Zod để định nghĩa Schema validation chặt chẽ, module này giúp bạn loại bỏ hoàn toàn các lỗi runtime. Hỗ trợ đầy đủ các trường hợp validation lồng nhau (Nested objects) và mảng dữ liệu động, cực kỳ phù hợp cho các trang Admin Dashboard.",
      authorName: "Author 5",
      voteCount: 45,
      repoUrl: "https://github.com/khanh-dev/form-pro",
      categoryId: catLogic.id,
    },
    {
      name: "Next.js Blog Dashboard",
      slug: "blog-dashboard",
      description: "Giao diện quản trị chuyên sâu dành cho các hệ thống quản lý nội dung (CMS). Tích hợp sẵn trình soạn thảo Rich Text hỗ trợ định dạng Markdown, hệ thống quản lý thư viện hình ảnh và phân tích dữ liệu bài viết cơ bản. Giao diện được thiết kế tối giản, tập trung vào hiệu suất làm việc của biên tập viên, giúp giảm thời gian đăng bài và tối ưu hóa quy trình kiểm duyệt nội dung.",
      authorName: "Author 6",
      voteCount: 67,
      repoUrl: "https://github.com/khanh-dev/blog-admin",
      categoryId: catTemplate.id,
    }
  ];

  for (const mod of superModules) {
    await prisma.module.create({ data: mod });
  }

  console.log("✅ Đã đổ dữ liệu mẫu dài và chuẩn chỉnh vào Dashboard!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });