import "dotenv/config";
import { PrismaClient, SubmissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "game" }, update: {}, create: { name: "Game", slug: "game" } }),
    prisma.category.upsert({ where: { slug: "utility" }, update: {}, create: { name: "Utility", slug: "utility" } }),
    prisma.category.upsert({ where: { slug: "finance" }, update: {}, create: { name: "Finance", slug: "finance" } }),
    prisma.category.upsert({ where: { slug: "productivity" }, update: {}, create: { name: "Productivity", slug: "productivity" } }),
    prisma.category.upsert({ where: { slug: "social" }, update: {}, create: { name: "Social", slug: "social" } }),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@td.com" },
    update: {},
    create: { name: "TD Admin", email: "admin@td.com", isAdmin: true },
  });

  const contributor = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: { name: "Dev User", email: "dev@example.com", isAdmin: false },
  });

  const miniApps = [
    {
      slug: "pomodoro-timer",
      name: "Pomodoro Timer",
      description: "A simple Pomodoro timer to help you stay focused. Supports custom work/break intervals.",
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
      description: "Track expenses with categories and summaries.",
      repoUrl: "https://github.com/example/expense-tracker",
      demoUrl: "https://expense.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 18,
    },
  ];

  for (const mod of miniApps) {
    await prisma.miniApp.upsert({ where: { slug: mod.slug }, update: {}, create: mod });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });