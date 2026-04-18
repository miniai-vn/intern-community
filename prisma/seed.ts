import "dotenv/config";
import { PrismaClient, SubmissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {

  await prisma.miniApp.deleteMany({}); // Xóa app trước vì nó có khóa ngoại tới User
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("🗑️ Đã xóa sạch dữ liệu cũ...");

  // Seed categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "game" },
      update: {},
      create: { name: "Game", slug: "game" },
    }),
    prisma.category.upsert({
      where: { slug: "utility" },
      update: {},
      create: { name: "Utility", slug: "utility" },
    }),
    prisma.category.upsert({
      where: { slug: "finance" },
      update: {},
      create: { name: "Finance", slug: "finance" },
    }),
    prisma.category.upsert({
      where: { slug: "productivity" },
      update: {},
      create: { name: "Productivity", slug: "productivity" },
    }),
    prisma.category.upsert({
      where: { slug: "social" },
      update: {},
      create: { name: "Social", slug: "social" },
    }),
  ]);

  // Seed demo admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@td.com" },
    update: {},
    create: {
      name: "TD Admin",
      email: "admin@td.com",
      isAdmin: true,
    },
  });

  // Seed demo contributor
  const contributor = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {
      image: "/default-avatar.jpg",
    },
    create: {
      name: "Demo Dev",
      email: "dev@example.com",
      isAdmin: false,
    },
  });

  // --- BỔ SUNG: 2 contributor mới (để test Leaderboard hạng 2, 3) ---
  const contributor2 = await prisma.user.upsert({
    where: { email: "hao_scholar@sgu.edu.vn" },
    update: {},
    create: {
      name: "Nguyễn Vũ Hào",
      email: "hao_scholar@sgu.edu.vn",
      image: "/default-avatar.jpg",
    },
  });

  const contributor3 = await prisma.user.upsert({
    where: { email: "intern_pro@example.com" },
    update: {},
    create: {
      name: "Pro Intern",
      email: "intern_pro@example.com",
    },
  });
  // --- KẾT THÚC BỔ SUNG contributor mới ---

  // Seed approved mini-apps (displayed as "Modules" in the UI)
  const approvedModules = [
    {
      slug: "pomodoro-timer",
      name: "Pomodoro Timer",
      description:
        "A simple Pomodoro timer to help you stay focused. Built with vanilla JS. Supports custom work/break intervals.",
      repoUrl: "https://github.com/example/pomodoro-timer",
      demoUrl: "https://pomodoro.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 24,
    },
    {
      slug: "expense-tracker",
      name: "Expense Tracker",
      description:
        "Track your daily expenses with categories and monthly summaries. Supports CSV export.",
      repoUrl: "https://github.com/example/expense-tracker",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 18,
    },
    {
      slug: "2048-game",
      name: "2048 Game",
      description:
        "Classic 2048 puzzle game. Keyboard and touch support. Saves high score to localStorage.",
      repoUrl: "https://github.com/example/2048",
      demoUrl: "https://2048.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor.id,
      voteCount: 41,
    },
    // --- BỔ SUNG: Approved modules của contributor2 (Nguyễn Vũ Hào) ---
    {
      slug: "sgu-helper",
      name: "SGU Helper",
      description: "Công cụ hỗ trợ sinh viên SGU tra cứu lịch học.",
      repoUrl: "https://github.com/hao/sgu-helper",
      demoUrl: "https://sgu-helper.vercel.app",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor2.id,
      voteCount: 50,
    },
    {
      slug: "fastapi-template",
      name: "FastAPI Backend Template",
      description: "Template chuẩn cho dự án Backend dùng FastAPI.",
      repoUrl: "https://github.com/hao/fastapi-template",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor2.id,
      voteCount: 30,
    },
    // --- BỔ SUNG: Approved module của contributor3 ---
    {
      slug: "weather-notif",
      name: "Weather Notifier",
      description: "Gửi thông báo thời tiết mỗi sáng.",
      repoUrl: "https://github.com/intern/weather",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor3.id,
      voteCount: 5,
    },
    // --- KẾT THÚC BỔ SUNG approved modules ---
  ];

  for (const mod of approvedModules) {
    await prisma.miniApp.upsert({
      where: { slug: mod.slug },
      update: {},
      create: mod,
    });
  }

  // Seed pending submissions (for admin panel demo)
  const pendingModules = [
    {
      slug: "markdown-editor",
      name: "Markdown Editor",
      description:
        "Live-preview markdown editor with syntax highlighting. Based on CodeMirror.",
      repoUrl: "https://github.com/example/md-editor",
      demoUrl: null,
      status: SubmissionStatus.PENDING,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 0,
    },
    {
      slug: "habit-tracker",
      name: "Habit Tracker",
      description:
        "Build and track daily habits with streak visualization. Sends browser notifications.",
      repoUrl: "https://github.com/example/habit-tracker",
      demoUrl: "https://habits.example.com",
      status: SubmissionStatus.PENDING,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 0,
    },
  ];

  for (const mod of pendingModules) {
    await prisma.miniApp.upsert({
      where: { slug: mod.slug },
      update: {},
      create: mod,
    });
  }

  // --- BỔ SUNG: Rejected module (để test Notification cho Demo Dev) ---
  const rejectedModules = [
    {
      slug: "spam-bot",
      name: "Auto Spam Bot",
      description: "A tool that should be rejected.",
      repoUrl: "https://github.com/example/spam",
      demoUrl: null,
      status: SubmissionStatus.REJECTED,
      feedback: "Vi phạm quy định: Không cho phép các công cụ spam.",
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor.id,
      voteCount: 0,
    },
  ];

  for (const mod of rejectedModules) {
    await prisma.miniApp.upsert({
      where: { slug: mod.slug },
      update: { status: mod.status, feedback: mod.feedback || null },
      create: mod,
    });
  }
  // --- KẾT THÚC BỔ SUNG rejected modules ---

  console.log("✅ Seed complete");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${approvedModules.length} approved modules`);
  console.log(`   ${pendingModules.length} pending modules`);
  // --- BỔ SUNG: Log thêm thông tin contributor ---
  console.log(`   - Contributor 1 (Demo Dev): 3 Approved, 1 Rejected`);
  console.log(`   - Contributor 2 (Vũ Hào): 2 Approved`);
  console.log(`   - Contributor 3 (Intern): 1 Approved`);
  // --- KẾT THÚC BỔ SUNG log ---
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());