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
  await prisma.user.upsert({
    where: { email: "admin@td.com" },
    update: {},
    create: {
      name: "TD Admin",
      email: "admin@td.com",
      isAdmin: true,
    },
  });

  // Seed demo contributors (multiple users for leaderboard variety)
  const contributors = await Promise.all([
    prisma.user.upsert({ where: { email: "dev@example.com" }, update: {}, create: { name: "Demo Dev", email: "dev@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "alice@example.com" }, update: {}, create: { name: "Alice Chen", email: "alice@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "bob@example.com" }, update: {}, create: { name: "Bob Martinez", email: "bob@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "carol@example.com" }, update: {}, create: { name: "Carol Kim", email: "carol@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "david@example.com" }, update: {}, create: { name: "David Nguyen", email: "david@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "eva@example.com" }, update: {}, create: { name: "Eva Patel", email: "eva@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "frank@example.com" }, update: {}, create: { name: "Frank Liu", email: "frank@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "grace@example.com" }, update: {}, create: { name: "Grace Park", email: "grace@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "henry@example.com" }, update: {}, create: { name: "Henry Tran", email: "henry@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "iris@example.com" }, update: {}, create: { name: "Iris Johansson", email: "iris@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "jack@example.com" }, update: {}, create: { name: "Jack Okonkwo", email: "jack@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "kate@example.com" }, update: {}, create: { name: "Kate Müller", email: "kate@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "leo@example.com" }, update: {}, create: { name: "Leo Santos", email: "leo@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "mia@example.com" }, update: {}, create: { name: "Mia Nakamura", email: "mia@example.com", isAdmin: false } }),
    prisma.user.upsert({ where: { email: "noah@example.com" }, update: {}, create: { name: "Noah Williams", email: "noah@example.com", isAdmin: false } }),
  ]);

  const [contributor, alice, bob, carol, david, eva, frank, grace, henry, iris, jack, kate, leo, mia, noah] = contributors;

  const now = new Date();
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
    {
      slug: "color-palette-generator",
      name: "Color Palette Generator",
      description:
        "Generate beautiful color palettes from a seed color. Exports to CSS variables and Tailwind config.",
      repoUrl: "https://github.com/example/color-palette",
      demoUrl: "https://palette.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: alice.id,
      voteCount: 33,
    },
    {
      slug: "regex-tester",
      name: "Regex Tester",
      description:
        "Interactive regex tester with match highlighting and explanation tooltips.",
      repoUrl: "https://github.com/example/regex-tester",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: alice.id,
      voteCount: 19,
    },
    {
      slug: "budget-planner",
      name: "Budget Planner",
      description:
        "Monthly budget planner with category breakdowns and savings goals tracker.",
      repoUrl: "https://github.com/example/budget-planner",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: bob.id,
      voteCount: 15,
    },
    {
      slug: "standup-bot",
      name: "Standup Bot",
      description:
        "Automate daily standup notes. Saves answers and generates a weekly summary report.",
      repoUrl: "https://github.com/example/standup-bot",
      demoUrl: "https://standup.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: carol.id,
      voteCount: 28,
    },
    {
      slug: "flashcard-app",
      name: "Flashcard App",
      description:
        "Spaced repetition flashcard app with deck sharing and progress tracking.",
      repoUrl: "https://github.com/example/flashcards",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: david.id,
      voteCount: 11,
    },
    {
      slug: "currency-converter",
      name: "Currency Converter",
      description: "Real-time currency converter supporting 150+ currencies with historical rate charts.",
      repoUrl: "https://github.com/example/currency-converter",
      demoUrl: "https://currency.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: eva.id,
      voteCount: 22,
    },
    {
      slug: "markdown-resume-builder",
      name: "Markdown Resume Builder",
      description: "Build and export a clean resume from Markdown. Supports multiple themes and PDF export.",
      repoUrl: "https://github.com/example/md-resume",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: frank.id,
      voteCount: 17,
    },
    {
      slug: "typing-speed-test",
      name: "Typing Speed Test",
      description: "Measure your typing speed and accuracy with custom text passages and leaderboard.",
      repoUrl: "https://github.com/example/typing-test",
      demoUrl: "https://typing.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: grace.id,
      voteCount: 36,
    },
    {
      slug: "ip-lookup",
      name: "IP Lookup Tool",
      description: "Look up geolocation, ISP, and threat data for any IP address or domain.",
      repoUrl: "https://github.com/example/ip-lookup",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: henry.id,
      voteCount: 9,
    },
    {
      slug: "json-diff-viewer",
      name: "JSON Diff Viewer",
      description: "Side-by-side JSON diff viewer with syntax highlighting and collapsible nodes.",
      repoUrl: "https://github.com/example/json-diff",
      demoUrl: "https://jsondiff.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: iris.id,
      voteCount: 14,
    },
    {
      slug: "daily-journal",
      name: "Daily Journal",
      description: "Minimalist daily journal with mood tracking and weekly reflection prompts.",
      repoUrl: "https://github.com/example/daily-journal",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: jack.id,
      voteCount: 20,
    },
    {
      slug: "svg-icon-generator",
      name: "SVG Icon Generator",
      description: "Generate custom SVG icons from text prompts. Export as SVG or PNG.",
      repoUrl: "https://github.com/example/svg-icons",
      demoUrl: "https://icons.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: kate.id,
      voteCount: 31,
    },
    {
      slug: "workout-tracker",
      name: "Workout Tracker",
      description: "Log workouts, track PRs, and visualize progress over time with chart breakdowns.",
      repoUrl: "https://github.com/example/workout-tracker",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: leo.id,
      voteCount: 25,
    },
    {
      slug: "quiz-maker",
      name: "Quiz Maker",
      description: "Create and share quizzes with multiple choice, true/false, and short answer formats.",
      repoUrl: "https://github.com/example/quiz-maker",
      demoUrl: "https://quiz.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: mia.id,
      voteCount: 13,
    },
    {
      slug: "link-shortener",
      name: "Link Shortener",
      description: "Simple link shortener with click analytics and custom slug support.",
      repoUrl: "https://github.com/example/link-shortener",
      demoUrl: "https://links.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: noah.id,
      voteCount: 8,
    },
  ];

  for (const mod of approvedModules) {
    await prisma.miniApp.upsert({
      where: { slug: mod.slug },
      update: { createdAt: now },
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

  console.log("✅ Seed complete");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${contributors.length + 1} users (${contributors.length} contributors + 1 admin)`);
  console.log(`   ${approvedModules.length} approved modules`);
  console.log(`   ${pendingModules.length} pending modules`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
