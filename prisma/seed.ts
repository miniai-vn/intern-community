import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, SubmissionStatus } from "@prisma/client";
import "dotenv/config";

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
    }, {
    slug: "flashcard-app",
    name: "Flashcard App",
    description: "Learn anything with spaced repetition flashcards. Create decks, track progress.",
    repoUrl: "https://github.com/example/flashcard",
    demoUrl: "https://flashcard.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "productivity")!.id,
    authorId: contributor.id,
    voteCount: 12,
  },
  {
    slug: "weather-widget",
    name: "Weather Widget",
    description: "Display current weather and 5-day forecast for any city. Uses OpenWeatherMap API.",
    repoUrl: "https://github.com/example/weather",
    demoUrl: "https://weather.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "utility")!.id,
    authorId: contributor.id,
    voteCount: 8,
  },
  {
    slug: "todo-list",
    name: "Todo List",
    description: "Simple drag-and-drop todo list with local storage persistence.",
    repoUrl: "https://github.com/example/todo",
    demoUrl: "https://todo.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "productivity")!.id,
    authorId: contributor.id,
    voteCount: 32,
  },
  {
    slug: "calculator",
    name: "Calculator",
    description: "Scientific calculator with history. Supports basic operations and memory functions.",
    repoUrl: "https://github.com/example/calculator",
    demoUrl: "https://calc.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "utility")!.id,
    authorId: contributor.id,
    voteCount: 15,
  },
  {
    slug: "chat-room",
    name: "Chat Room",
    description: "Real-time chat room using WebSockets. Multiple rooms and emoji support.",
    repoUrl: "https://github.com/example/chat",
    demoUrl: "https://chat.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "social")!.id,
    authorId: contributor.id,
    voteCount: 27,
  },
  {
    slug: "budget-planner",
    name: "Budget Planner",
    description: "Plan monthly budget, track spending by category, visualize with charts.",
    repoUrl: "https://github.com/example/budget",
    demoUrl: "https://budget.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "finance")!.id,
    authorId: contributor.id,
    voteCount: 11,
  },
  {
    slug: "snake-game",
    name: "Snake Game",
    description: "Classic Snake game with keyboard controls. Eat food to grow longer.",
    repoUrl: "https://github.com/example/snake",
    demoUrl: "https://snake.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "game")!.id,
    authorId: contributor.id,
    voteCount: 35,
  },
  {
    slug: "note-taking",
    name: "Note Taking App",
    description: "Markdown notes with tags, search, and auto-save. Export to PDF.",
    repoUrl: "https://github.com/example/notes",
    demoUrl: "https://notes.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "productivity")!.id,
    authorId: contributor.id,
    voteCount: 22,
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    description: "Real-time currency conversion using ExchangeRate API. Supports 160+ currencies.",
    repoUrl: "https://github.com/example/currency",
    demoUrl: "https://currency.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "finance")!.id,
    authorId: contributor.id,
    voteCount: 14,
  },
  {
    slug: "memory-game",
    name: "Memory Game",
    description: "Match pairs of cards to test your memory. Multiple difficulty levels.",
    repoUrl: "https://github.com/example/memory",
    demoUrl: "https://memory.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "game")!.id,
    authorId: contributor.id,
    voteCount: 19,
  },
  {
    slug: "qr-code-gen",
    name: "QR Code Generator",
    description: "Generate QR codes for any text or URL. Download as PNG or SVG.",
    repoUrl: "https://github.com/example/qr-code",
    demoUrl: "https://qr.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "utility")!.id,
    authorId: contributor.id,
    voteCount: 9,
  },
  {
    slug: "habitify",
    name: "Habitify",
    description: "Track daily habits with heatmap calendar and weekly reports.",
    repoUrl: "https://github.com/example/habitify",
    demoUrl: "https://habitify.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "productivity")!.id,
    authorId: contributor.id,
    voteCount: 16,
  },
  {
    slug: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic Tic Tac Toe game. Play against AI or with friends.",
    repoUrl: "https://github.com/example/tic-tac-toe",
    demoUrl: "https://tictactoe.example.com",
    status: SubmissionStatus.APPROVED,
    categoryId: categories.find((c) => c.slug === "game")!.id,
    authorId: contributor.id,
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
