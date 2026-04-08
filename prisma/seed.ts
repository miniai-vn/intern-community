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

  // Seed admin + contributors
  await prisma.user.upsert({
    where: { email: "admin@td.com" },
    update: { name: "TD Admin", isAdmin: true },
    create: {
      name: "TD Admin",
      email: "admin@td.com",
      isAdmin: true,
    },
  });

  const contributorSeeds = [
    { name: "Alice Nguyen", email: "alice@example.com" },
    { name: "Bao Tran", email: "bao@example.com" },
    { name: "Chi Le", email: "chi@example.com" },
    { name: "Dung Pham", email: "dung@example.com" },
    { name: "Emi Hoang", email: "emi@example.com" },
    { name: "Finn Vo", email: "finn@example.com" },
    { name: "Giang Do", email: "giang@example.com" },
    { name: "Huy Bui", email: "huy@example.com" },
    { name: "Iris Vu", email: "iris@example.com" },
    { name: "Jack Dang", email: "jack@example.com" },
    { name: "Khanh Mai", email: "khanh@example.com" },
    { name: "Linh Truong", email: "linh@example.com" },
  ];

  const contributors = await Promise.all(
    contributorSeeds.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, isAdmin: false },
        create: {
          name: user.name,
          email: user.email,
          isAdmin: false,
        },
      })
    )
  );

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  // Build UTC month boundaries for leaderboard testing.
  const now = new Date();
  const thisMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
  const prevMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0)
  );

  const makeUtcDateInCurrentMonth = (dayOfMonth: number) =>
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), Math.min(dayOfMonth, 28), 12, 0, 0, 0)
    );

  const makeUtcDateInPreviousMonth = (dayOfMonth: number) =>
    new Date(
      Date.UTC(
        prevMonthStart.getUTCFullYear(),
        prevMonthStart.getUTCMonth(),
        Math.min(dayOfMonth, 28),
        12,
        0,
        0,
        0
      )
    );

  // Reset mini-app demo records to keep seed deterministic.
  await prisma.miniApp.deleteMany({ where: { slug: { startsWith: "lb-" } } });

  // Number of APPROVED submissions in current UTC month per contributor.
  // Exactly 12 contributors so UI should show only top 10.
  const monthlyApprovedCounts = [7, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1];

  const approvedModules: Parameters<typeof prisma.miniApp.create>[0]["data"][] = [];

  contributors.forEach((user, index) => {
    const approvedCount = monthlyApprovedCounts[index] ?? 1;
    for (let i = 1; i <= approvedCount; i++) {
      const slug = `lb-${index + 1}-${i}-approved-current`;
      approvedModules.push({
        slug,
        name: `Leaderboard Module ${index + 1}-${i}`,
        description: `Approved module ${i} by ${user.name} in current UTC month.`,
        repoUrl: `https://github.com/example/${slug}`,
        demoUrl: i % 2 === 0 ? `https://${slug}.example.com` : null,
        status: SubmissionStatus.APPROVED,
        categoryId:
          categoryBySlug.get(i % 2 === 0 ? "productivity" : "utility")?.id ??
          categories[0].id,
        authorId: user.id,
        voteCount: (approvedCount - i + 1) * 3,
        createdAt: makeUtcDateInCurrentMonth(2 + i),
      });
    }
  });

  // Should NOT appear on leaderboard: approved but in previous month.
  const previousMonthApproved = [
    {
      slug: "lb-prev-month-approved-1",
      name: "Previous Month Approved 1",
      description: "Approved in previous month only.",
      repoUrl: "https://github.com/example/lb-prev-month-approved-1",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categoryBySlug.get("finance")?.id ?? categories[0].id,
      authorId: contributors[0].id,
      voteCount: 9,
      createdAt: makeUtcDateInPreviousMonth(10),
    },
    {
      slug: "lb-prev-month-approved-2",
      name: "Previous Month Approved 2",
      description: "Approved in previous month only.",
      repoUrl: "https://github.com/example/lb-prev-month-approved-2",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categoryBySlug.get("game")?.id ?? categories[0].id,
      authorId: contributors[1].id,
      voteCount: 11,
      createdAt: makeUtcDateInPreviousMonth(20),
    },
  ];

  // Should NOT appear on leaderboard: not approved in current month.
  const nonApprovedCurrentMonth = [
    {
      slug: "lb-pending-current-month",
      name: "Pending Current Month",
      description: "Pending module in current month.",
      repoUrl: "https://github.com/example/lb-pending-current-month",
      demoUrl: null,
      status: SubmissionStatus.PENDING,
      categoryId: categoryBySlug.get("social")?.id ?? categories[0].id,
      authorId: contributors[2].id,
      voteCount: 0,
      createdAt: new Date(thisMonthStart.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      slug: "lb-rejected-current-month",
      name: "Rejected Current Month",
      description: "Rejected module in current month.",
      repoUrl: "https://github.com/example/lb-rejected-current-month",
      demoUrl: null,
      status: SubmissionStatus.REJECTED,
      categoryId: categoryBySlug.get("social")?.id ?? categories[0].id,
      authorId: contributors[3].id,
      voteCount: 0,
      createdAt: new Date(thisMonthStart.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const allModules = [...approvedModules, ...previousMonthApproved, ...nonApprovedCurrentMonth];
  for (const mod of allModules) {
    await prisma.miniApp.create({ data: mod });
  }

  console.log("✅ Seed complete");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${contributors.length} contributors`);
  console.log(`   ${approvedModules.length} approved modules (current UTC month)`);
  console.log(`   ${previousMonthApproved.length} approved modules (previous month)`);
  console.log(`   ${nonApprovedCurrentMonth.length} non-approved modules (current month)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
