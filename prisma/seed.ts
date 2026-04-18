import "dotenv/config";
import { PrismaClient, SubmissionStatus, NotificationType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Categories ────────────────────────────────────────────────────────────
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

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // ─── Users ─────────────────────────────────────────────────────────────────

  // Admin — dùng để test panel + nhận notification hệ thống
  const admin = await prisma.user.upsert({
    where: { email: "admin@td.com" },
    update: {},
    create: {
      name: "TD Admin",
      email: "admin@td.com",
      isAdmin: true,
    },
  });

  // Contributor chính — có nhiều submission ở đủ trạng thái
  const contributor = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      name: "Demo Dev",
      email: "dev@example.com",
      isAdmin: false,
    },
  });

  // Contributor phụ — để test notification cho nhiều user
  const contributor2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Coder",
      email: "jane@example.com",
      isAdmin: false,
    },
  });

  // ─── MiniApps ──────────────────────────────────────────────────────────────

  type ModuleSeed = {
    slug: string;
    name: string;
    description: string;
    repoUrl: string;
    demoUrl: string | null;
    status: SubmissionStatus;
    feedback: string | null;
    categoryId: string;
    authorId: string;
    voteCount: number;
  };

  const moduleSeedData: ModuleSeed[] = [
    // ── APPROVED ──
    {
      slug: "pomodoro-timer",
      name: "Pomodoro Timer",
      description:
        "A simple Pomodoro timer to help you stay focused. Built with vanilla JS. Supports custom work/break intervals.",
      repoUrl: "https://github.com/example/pomodoro-timer",
      demoUrl: "https://pomodoro.example.com",
      status: SubmissionStatus.APPROVED,
      feedback: null,
      categoryId: catBySlug["productivity"].id,
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
      feedback: null,
      categoryId: catBySlug["finance"].id,
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
      feedback: null,
      categoryId: catBySlug["game"].id,
      authorId: contributor.id,
      voteCount: 41,
    },
    {
      slug: "color-picker",
      name: "Color Picker",
      description:
        "HEX / RGB / HSL color picker with clipboard copy and palette history. Zero dependencies.",
      repoUrl: "https://github.com/example/color-picker",
      demoUrl: "https://colorpicker.example.com",
      status: SubmissionStatus.APPROVED,
      feedback: null,
      categoryId: catBySlug["utility"].id,
      authorId: contributor2.id,
      voteCount: 33,
    },
    // ── REJECTED ──
    {
      slug: "crypto-ticker",
      name: "Crypto Ticker",
      description:
        "Real-time crypto price ticker using CoinGecko free API. Shows top 10 coins.",
      repoUrl: "https://github.com/example/crypto-ticker",
      demoUrl: null,
      status: SubmissionStatus.REJECTED,
      feedback:
        "Demo URL is missing and the repo has no README. Please add setup instructions and resubmit.",
      categoryId: catBySlug["finance"].id,
      authorId: contributor.id,
      voteCount: 0,
    },
    {
      slug: "social-share-buttons",
      name: "Social Share Buttons",
      description: "Lightweight share buttons for Twitter, Facebook and LinkedIn.",
      repoUrl: "https://github.com/example/share-buttons",
      demoUrl: null,
      status: SubmissionStatus.REJECTED,
      feedback:
        "Module is too trivial — functionality can be replaced by a single anchor tag. Consider expanding scope.",
      categoryId: catBySlug["social"].id,
      authorId: contributor2.id,
      voteCount: 0,
    },
    // ── PENDING ──
    {
      slug: "markdown-editor",
      name: "Markdown Editor",
      description:
        "Live-preview markdown editor with syntax highlighting. Based on CodeMirror.",
      repoUrl: "https://github.com/example/md-editor",
      demoUrl: null,
      status: SubmissionStatus.PENDING,
      feedback: null,
      categoryId: catBySlug["utility"].id,
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
      feedback: null,
      categoryId: catBySlug["productivity"].id,
      authorId: contributor.id,
      voteCount: 0,
    },
    {
      slug: "snake-game",
      name: "Snake Game",
      description: "Classic snake game built with HTML5 Canvas. Mobile-friendly controls.",
      repoUrl: "https://github.com/example/snake",
      demoUrl: "https://snake.example.com",
      status: SubmissionStatus.PENDING,
      feedback: null,
      categoryId: catBySlug["game"].id,
      authorId: contributor2.id,
      voteCount: 0,
    },
  ];

  const upsertedModules: Record<string, { id: string }> = {};
  for (const mod of moduleSeedData) {
    const result = await prisma.miniApp.upsert({
      where: { slug: mod.slug },
      update: {},
      create: mod,
    });
    upsertedModules[mod.slug] = result;
  }

  // ─── Notifications ─────────────────────────────────────────────────────────
  //
  // Mỗi kịch bản dưới đây test một trường hợp khác nhau của notification bell:
  //
  //  contributor  — có cả unread & read, approved & rejected  → badge hiện số unread
  //  contributor2 — tất cả đã read                            → badge ẩn (count = 0)
  //  admin        — có unread mới nhất                        → test admin nhận notification

  type NotifSeed = {
    userId: string;
    type: NotificationType;
    message: string;
    read: boolean;
    miniAppId: string | null;
    createdAt: Date;
  };

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

  const notifSeedData: NotifSeed[] = [
    // ── contributor: 3 unread ──
    {
      userId: contributor.id,
      type: NotificationType.SUBMISSION_APPROVED,
      message: 'Your module "Pomodoro Timer" has been approved and is now live.',
      read: false,
      miniAppId: upsertedModules["pomodoro-timer"].id,
      createdAt: daysAgo(0), // hôm nay
    },
    {
      userId: contributor.id,
      type: NotificationType.SUBMISSION_APPROVED,
      message: 'Your module "Expense Tracker" has been approved and is now live.',
      read: false,
      miniAppId: upsertedModules["expense-tracker"].id,
      createdAt: daysAgo(1),
    },
    {
      userId: contributor.id,
      type: NotificationType.SUBMISSION_REJECTED,
      message:
        'Your module "Crypto Ticker" was rejected. Feedback: "Demo URL is missing and the repo has no README. Please add setup instructions and resubmit."',
      read: false,
      miniAppId: upsertedModules["crypto-ticker"].id,
      createdAt: daysAgo(2),
    },
    // ── contributor: 2 đã đọc (lịch sử cũ) ──
    {
      userId: contributor.id,
      type: NotificationType.SUBMISSION_APPROVED,
      message: 'Your module "2048 Game" has been approved and is now live.',
      read: true,
      miniAppId: upsertedModules["2048-game"].id,
      createdAt: daysAgo(10),
    },
    {
      userId: contributor.id,
      type: NotificationType.SUBMISSION_REJECTED,
      message:
        'Your module "Crypto Ticker" was rejected. Feedback: "Demo URL is missing."',
      read: true,
      miniAppId: upsertedModules["crypto-ticker"].id,
      createdAt: daysAgo(15),
    },

    // ── contributor2: tất cả đã read → badge = 0 ──
    {
      userId: contributor2.id,
      type: NotificationType.SUBMISSION_APPROVED,
      message: 'Your module "Color Picker" has been approved and is now live.',
      read: true,
      miniAppId: upsertedModules["color-picker"].id,
      createdAt: daysAgo(3),
    },
    {
      userId: contributor2.id,
      type: NotificationType.SUBMISSION_REJECTED,
      message:
        'Your module "Social Share Buttons" was rejected. Feedback: "Module is too trivial."',
      read: true,
      miniAppId: upsertedModules["social-share-buttons"].id,
      createdAt: daysAgo(5),
    },

    // ── admin: 2 unread — test admin cũng nhận được notification ──
    {
      userId: admin.id,
      type: NotificationType.SUBMISSION_APPROVED,
      message: 'System: module "Pomodoro Timer" was auto-flagged for review after 50 votes.',
      read: false,
      miniAppId: upsertedModules["pomodoro-timer"].id,
      createdAt: daysAgo(0),
    },
    {
      userId: admin.id,
      type: NotificationType.SUBMISSION_REJECTED,
      message: 'System: your test rejection on "Crypto Ticker" has been logged.',
      read: false,
      miniAppId: upsertedModules["crypto-ticker"].id,
      createdAt: daysAgo(1),
    },
    // ── admin: 1 đã đọc ──
    {
      userId: admin.id,
      type: NotificationType.SUBMISSION_APPROVED,
      message: 'System: module "2048 Game" reached 40 votes milestone.',
      read: true,
      miniAppId: upsertedModules["2048-game"].id,
      createdAt: daysAgo(7),
    },
  ];

  // Dùng createMany + skipDuplicates để tránh insert trùng khi chạy seed nhiều lần.
  // Notification không có unique constraint tự nhiên nên ta xoá sạch trước khi insert.
  await prisma.notification.deleteMany({
    where: {
      userId: { in: [admin.id, contributor.id, contributor2.id] },
    },
  });
  await prisma.notification.createMany({ data: notifSeedData });

  // ─── Summary ───────────────────────────────────────────────────────────────
  const approvedCount = moduleSeedData.filter((m) => m.status === SubmissionStatus.APPROVED).length;
  const rejectedCount = moduleSeedData.filter((m) => m.status === SubmissionStatus.REJECTED).length;
  const pendingCount  = moduleSeedData.filter((m) => m.status === SubmissionStatus.PENDING).length;

  console.log("✅ Seed complete");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${moduleSeedData.length} modules  (${approvedCount} approved · ${rejectedCount} rejected · ${pendingCount} pending)`);
  console.log(`   ${notifSeedData.length} notifications`);
  console.log();
  console.log("📬 Notification summary per user:");
  console.log(`   contributor  (dev@example.com)  — 3 unread / 2 read`);
  console.log(`   contributor2 (jane@example.com) — 0 unread / 2 read`);
  console.log(`   admin        (admin@td.com)      — 2 unread / 1 read`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());