import "dotenv/config";
import { PrismaClient, SubmissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.miniApp.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  // 1. Seed Categories (giữ nguyên)
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "game" }, update: {}, create: { name: "Game", slug: "game" } }),
    prisma.category.upsert({ where: { slug: "utility" }, update: {}, create: { name: "Utility", slug: "utility" } }),
    prisma.category.upsert({ where: { slug: "finance" }, update: {}, create: { name: "Finance", slug: "finance" } }),
    prisma.category.upsert({ where: { slug: "productivity" }, update: {}, create: { name: "Productivity", slug: "productivity" } }),
    prisma.category.upsert({ where: { slug: "social" }, update: {}, create: { name: "Social", slug: "social" } }),
  ]);

  const cat = (slug: string) => categories.find((c) => c.slug === slug)!.id;

  // 2. Seed Contributors (6 người để test đủ hạng)
  const users = await Promise.all([
    // Hạng 1: Demo Dev (5 Modules)
    prisma.user.create({ data: { name: "Demo Dev", email: "dev@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev" } }),
    // Hạng 2: Nguyễn Vũ Hào (4 Modules)
    prisma.user.create({ data: { name: "Nguyễn Vũ Hào", email: "hao@sgu.edu.vn", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=hao" } }),
    // Hạng 3: Pro Intern (3 Modules)
    prisma.user.create({ data: { name: "Pro Intern", email: "pro@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=pro" } }),
    // Hạng 4: Lê Minh (2 Modules)
    prisma.user.create({ data: { name: "Lê Minh", email: "minh@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=minh" } }),
    // Hạng 5: Trần Anh (1 Module)
    prisma.user.create({ data: { name: "Trần Anh", email: "anh@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=anh" } }),
    // Hạng 6: Hoàng Yến (1 Module)
    prisma.user.create({ data: { name: "Hoàng Yến", email: "yen@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=yen" } }),
  ]);

  const [u1, u2, u3, u4, u5, u6] = users;

  // 3. Seed Approved Modules (Phân bổ số lượng để tạo hạng)
  const approvedModules = [
    // u1 - Demo Dev (5)
    { slug: "pomodoro", name: "Pomodoro Timer", authorId: u1.id, categoryId: cat("productivity"), voteCount: 45 },
    { slug: "expense", name: "Expense Tracker", authorId: u1.id, categoryId: cat("finance"), voteCount: 32 },
    { slug: "2048", name: "2048 Game", authorId: u1.id, categoryId: cat("game"), voteCount: 89 },
    { slug: "markdown", name: "Markdown Live", authorId: u1.id, categoryId: cat("utility"), voteCount: 12 },
    { slug: "habit", name: "Habit Tracker", authorId: u1.id, categoryId: cat("productivity"), voteCount: 22 },

    // u2 - Nguyễn Vũ Hào (4)
    { slug: "sgu-helper", name: "SGU Helper", authorId: u2.id, categoryId: cat("utility"), voteCount: 150 },
    { slug: "fastapi-tpl", name: "FastAPI Template", authorId: u2.id, categoryId: cat("utility"), voteCount: 67 },
    { slug: "json-viewer", name: "JSON Viewer", authorId: u2.id, categoryId: cat("utility"), voteCount: 40 },
    { slug: "go-link", name: "SGU Shortener", authorId: u2.id, categoryId: cat("social"), voteCount: 25 },

    // u3 - Pro Intern (3)
    { slug: "weather", name: "Weather Notifier", authorId: u3.id, categoryId: cat("utility"), voteCount: 15 },
    { slug: "music", name: "Simple Music Player", authorId: u3.id, categoryId: cat("game"), voteCount: 30 },
    { slug: "todo-pro", name: "Todo Pro", authorId: u3.id, categoryId: cat("productivity"), voteCount: 10 },

    // u4 - Lê Minh (2)
    { slug: "password-gen", name: "Strong Password Gen", authorId: u4.id, categoryId: cat("utility"), voteCount: 55 },
    { slug: "currency", name: "Currency Converter", authorId: u4.id, categoryId: cat("finance"), voteCount: 18 },

    // u5 - Trần Anh (1)
    { slug: "unit-conv", name: "Unit Converter", authorId: u5.id, categoryId: cat("utility"), voteCount: 9 },

    // u6 - Hoàng Yến (1)
    { slug: "random-quote", name: "Daily Quotes", authorId: u6.id, categoryId: cat("social"), voteCount: 102 },
  ];

  for (const mod of approvedModules) {
    await prisma.miniApp.create({
      data: {
        ...mod,
        description: `Mô tả demo cho ${mod.name}. Công cụ tuyệt vời dành cho cộng đồng Intern.`,
        status: SubmissionStatus.APPROVED,
        repoUrl: "https://github.com/example/repo",
      },
    });
  }
  // --- KẾT THÚC BỔ SUNG rejected modules ---

  console.log("✅ Seed thành công!");
  console.log("📊 Xếp hạng dự kiến:");
  console.log("1. Demo Dev (5)");
  console.log("2. Nguyễn Vũ Hào (4)");
  console.log("3. Pro Intern (3)");
  console.log("4. Lê Minh (2)");
  console.log("5. Trần Anh & Hoàng Yến (1)");
  // --- KẾT THÚC BỔ SUNG log ---
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());