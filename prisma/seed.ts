import "dotenv/config";
import { PrismaClient, SubmissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
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
    update: {},
    create: {
      name: "Demo Dev",
      email: "dev@example.com",
      isAdmin: false,
    },
  });

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

  // ========== ADDITIONAL DATA FOR LEADERBOARD TESTING ==========
  // Create extra users with varying numbers of approved submissions
  const testUsers = [
    { email: "alice@leaderboard.com", name: "Alice Chen" },
    { email: "bob@leaderboard.com", name: "Bob Smith" },
    { email: "charlie@leaderboard.com", name: "Charlie Brown" },
    { email: "david@leaderboard.com", name: "David Kim" },
    { email: "eve@leaderboard.com", name: "Eve Wong" },
    { email: "frank@leaderboard.com", name: "Frank Miller" },
    { email: "grace@leaderboard.com", name: "Grace Lee" },
    { email: "henry@leaderboard.com", name: "Henry Zhang" },
    { email: "ivy@leaderboard.com", name: "Ivy Patel" },
    { email: "jack@leaderboard.com", name: "Jack White" },
  ];

  const createdTestUsers = [];
  for (const u of testUsers) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        isAdmin: false,
      },
    });
    createdTestUsers.push(created);
  }

  // Number of approved submissions per user (order matches createdTestUsers)
  const approvedCounts = [5, 5, 4, 3, 2, 1, 1, 0, 0, 0];
  // Explanation: Alice=5, Bob=5 (tie for 1st), Charlie=4, David=3, Eve=2, Frank=1, Grace=1, others 0

  const categoryIds = categories.map(c => c.id);
  const getRandomCategoryId = () => categoryIds[Math.floor(Math.random() * categoryIds.length)];

  let moduleCounter = 1;
  for (let i = 0; i < createdTestUsers.length; i++) {
    const user = createdTestUsers[i];
    const count = approvedCounts[i];
    for (let j = 0; j < count; j++) {
      const slug = `leaderboard-module-${moduleCounter++}`;
      await prisma.miniApp.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: `${user.name}'s Module ${j+1}`,
          description: `Demo module for leaderboard testing. Created for ${user.name}.`,
          repoUrl: `https://github.com/example/${slug}`,
          demoUrl: null,
          status: SubmissionStatus.APPROVED,
          categoryId: getRandomCategoryId(),
          authorId: user.id,
          voteCount: Math.floor(Math.random() * 100),
        },
      });
    }
  }

  console.log("✅ Seed complete");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${approvedModules.length} approved modules (original)`);
  console.log(`   ${pendingModules.length} pending modules`);
  console.log(`   ${moduleCounter - 1} extra approved modules for leaderboard testing`);
  console.log(`   Total test users: ${createdTestUsers.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());