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

  // Seed demo users
  const admin = await prisma.user.upsert({
    where: { email: "admin@td.com" },
    update: {},
    create: {
      name: "TD Admin",
      email: "admin@td.com",
      isAdmin: true,
    },
  });

  const contributor = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      name: "Demo Dev",
      email: "dev@example.com",
      isAdmin: false,
    },
  });

  const contributor2 = await prisma.user.upsert({
    where: { email: "maker@example.com" },
    update: {},
    create: {
      name: "Demo Maker",
      email: "maker@example.com",
      isAdmin: false,
    },
  });

  const contributor3 = await prisma.user.upsert({
    where: { email: "coder@example.com" },
    update: {},
    create: {
      name: "Code Enthusiast",
      email: "coder@example.com",
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
    {
      slug: "team-chat",
      name: "Team Chat",
      description:
        "A lightweight chat app for teams, with channels, mentions, and file sharing.",
      repoUrl: "https://github.com/example/team-chat",
      demoUrl: "https://chat.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor2.id,
      voteCount: 27,
    },
    {
      slug: "password-manager",
      name: "Password Manager",
      description:
        "Store and organize passwords securely with browser autofill support.",
      repoUrl: "https://github.com/example/password-manager",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor2.id,
      voteCount: 44,
    },
    {
      slug: "stock-screener",
      name: "Stock Screener",
      description:
        "Search stocks by sector, market cap, and valuation metrics to build watch lists.",
      repoUrl: "https://github.com/example/stock-screener",
      demoUrl: "https://stocks.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 32,
    },
    {
      slug: "recipe-book",
      name: "Recipe Book",
      description:
        "Save recipes, plan meals, and generate shopping lists from your favorite dishes.",
      repoUrl: "https://github.com/example/recipe-book",
      demoUrl: "https://recipes.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor2.id,
      voteCount: 20,
    },
    {
      slug: "weather-dashboard",
      name: "Weather Dashboard",
      description:
        "Local weather, 5-day forecasts, and sunrise/sunset times with animated weather cards.",
      repoUrl: "https://github.com/example/weather-dashboard",
      demoUrl: "https://weather.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 16,
    },
    {
      slug: "study-planner",
      name: "Study Planner",
      description:
        "Organize your study sessions, subjects, and deadlines with a clean planner interface.",
      repoUrl: "https://github.com/example/study-planner",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor2.id,
      voteCount: 35,
    },
    {
      slug: "event-invites",
      name: "Event Invites",
      description:
        "Create shareable event pages, RSVP tracking, and calendar integration for meetups.",
      repoUrl: "https://github.com/example/event-invites",
      demoUrl: "https://events.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor.id,
      voteCount: 14,
    },
    {
      slug: "focus-sounds",
      name: "Focus Sounds",
      description:
        "Ambient sound mixer with white noise, rain, and forest tracks for concentration.",
      repoUrl: "https://github.com/example/focus-sounds",
      demoUrl: "https://focus.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor2.id,
      voteCount: 21,
    },
    {
      slug: "budget-splitter",
      name: "Budget Splitter",
      description:
        "Split expenses with friends and calculate how much each person owes after group events.",
      repoUrl: "https://github.com/example/budget-splitter",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 29,
    },
    {
      slug: "color-picker",
      name: "Color Picker",
      description:
        "Pick colors, copy values in HEX/RGB/HSL, and save palettes for future design work.",
      repoUrl: "https://github.com/example/color-picker",
      demoUrl: "https://colors.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor2.id,
      voteCount: 12,
    },
    {
      slug: "language-flashcards",
      name: "Language Flashcards",
      description:
        "Practice vocabulary with spaced repetition and multiple choice review cards.",
      repoUrl: "https://github.com/example/language-flashcards",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 18,
    },
    {
      slug: "community-map",
      name: "Community Map",
      description:
        "Discover local meetups, coding groups, and shared workspaces from the developer community.",
      repoUrl: "https://github.com/example/community-map",
      demoUrl: "https://community.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor2.id,
      voteCount: 9,
    },
    {
      slug: "meeting-timer",
      name: "Meeting Timer",
      description:
        "Keep meetings on track with agenda timers, speaker cues, and automatic timeboxing.",
      repoUrl: "https://github.com/example/meeting-timer",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 19,
    },
    {
      slug: "snake-game",
      name: "Snake Game",
      description:
        "Classic Snake game with smooth controls, score tracking, and retro pixel art.",
      repoUrl: "https://github.com/example/snake-game",
      demoUrl: "https://snake.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor3.id,
      voteCount: 33,
    },
    {
      slug: "todo-list",
      name: "Smart Todo List",
      description:
        "AI-powered task management with smart suggestions, priority scoring, and deadline reminders.",
      repoUrl: "https://github.com/example/todo-list",
      demoUrl: "https://todo.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor3.id,
      voteCount: 28,
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

  console.log("✅ Seed complete");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${approvedModules.length} approved modules`);
  console.log(`   ${pendingModules.length} pending modules`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
