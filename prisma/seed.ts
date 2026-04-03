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
    // --- 20 extra modules for pagination demo ---
    {
      slug: "color-palette-generator",
      name: "Color Palette Generator",
      description: "Generate beautiful color palettes from a base color. Export to CSS variables or Tailwind config.",
      repoUrl: "https://github.com/example/color-palette",
      demoUrl: "https://palette.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 15,
    },
    {
      slug: "markdown-previewer",
      name: "Markdown Previewer",
      description: "Live side-by-side markdown editor and preview. Supports GFM tables, code blocks, and emoji.",
      repoUrl: "https://github.com/example/md-preview",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 9,
    },
    {
      slug: "ip-address-tracker",
      name: "IP Address Tracker",
      description: "Look up any IP address or domain and see its location on an interactive map.",
      repoUrl: "https://github.com/example/ip-tracker",
      demoUrl: "https://ip-tracker.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 7,
    },
    {
      slug: "budget-calculator",
      name: "Budget Calculator",
      description: "Plan your monthly budget with income, fixed costs, and flexible spending categories.",
      repoUrl: "https://github.com/example/budget-calc",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 12,
    },
    {
      slug: "crypto-price-ticker",
      name: "Crypto Price Ticker",
      description: "Real-time cryptocurrency prices using the CoinGecko public API. Supports favourites list.",
      repoUrl: "https://github.com/example/crypto-ticker",
      demoUrl: "https://crypto.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 33,
    },
    {
      slug: "snake-game",
      name: "Snake Game",
      description: "The classic snake game with smooth movement, increasing speed, and a high-score leaderboard.",
      repoUrl: "https://github.com/example/snake",
      demoUrl: "https://snake.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor.id,
      voteCount: 29,
    },
    {
      slug: "minesweeper",
      name: "Minesweeper",
      description: "Classic minesweeper with three difficulty levels and a timer. Built with React.",
      repoUrl: "https://github.com/example/minesweeper",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor.id,
      voteCount: 22,
    },
    {
      slug: "word-counter",
      name: "Word Counter",
      description: "Count words, characters, sentences, and paragraphs. Estimates reading time automatically.",
      repoUrl: "https://github.com/example/word-counter",
      demoUrl: "https://wordcount.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 6,
    },
    {
      slug: "kanban-board",
      name: "Kanban Board",
      description: "Drag-and-drop kanban board stored in localStorage. Add columns and cards freely.",
      repoUrl: "https://github.com/example/kanban",
      demoUrl: "https://kanban.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 37,
    },
    {
      slug: "focus-music-player",
      name: "Focus Music Player",
      description: "Ambient sound mixer with rain, café noise, and white noise. Designed for deep work sessions.",
      repoUrl: "https://github.com/example/focus-music",
      demoUrl: "https://focusmusic.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 20,
    },
    {
      slug: "qr-code-generator",
      name: "QR Code Generator",
      description: "Generate QR codes for URLs, text, or contact cards. Download as PNG or SVG.",
      repoUrl: "https://github.com/example/qr-gen",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 11,
    },
    {
      slug: "password-generator",
      name: "Password Generator",
      description: "Generate strong, random passwords with configurable length, symbols, and numerals.",
      repoUrl: "https://github.com/example/pwd-gen",
      demoUrl: "https://pwdgen.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 19,
    },
    {
      slug: "quiz-app",
      name: "Quiz App",
      description: "Create and share multiple-choice quizzes. Tracks scores and shows explanations after each question.",
      repoUrl: "https://github.com/example/quiz-app",
      demoUrl: "https://quiz.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor.id,
      voteCount: 14,
    },
    {
      slug: "poll-creator",
      name: "Poll Creator",
      description: "Create one-click polls and share the link. Results update in real-time.",
      repoUrl: "https://github.com/example/poll-creator",
      demoUrl: "https://polls.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor.id,
      voteCount: 8,
    },
    {
      slug: "recipe-box",
      name: "Recipe Box",
      description: "Save and organise your favourite recipes. Filter by ingredient or cooking time.",
      repoUrl: "https://github.com/example/recipe-box",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 5,
    },
    {
      slug: "unit-converter",
      name: "Unit Converter",
      description: "Convert between length, mass, temperature, and currency units instantly.",
      repoUrl: "https://github.com/example/unit-converter",
      demoUrl: "https://convert.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 16,
    },
    {
      slug: "flashcard-app",
      name: "Flashcard App",
      description: "Spaced-repetition flashcard app. Import decks from CSV. Tracks your memory performance over time.",
      repoUrl: "https://github.com/example/flashcards",
      demoUrl: "https://flashcards.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 27,
    },
    {
      slug: "typing-speed-test",
      name: "Typing Speed Test",
      description: "Measure your WPM and accuracy with random passages. Tracks personal bests over time.",
      repoUrl: "https://github.com/example/typing-test",
      demoUrl: "https://typing.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor.id,
      voteCount: 31,
    },
    {
      slug: "daily-journal",
      name: "Daily Journal",
      description: "Private local-first daily journal with mood tracking and search. No account needed.",
      repoUrl: "https://github.com/example/daily-journal",
      demoUrl: null,
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 10,
    },
    {
      slug: "stock-watchlist",
      name: "Stock Watchlist",
      description: "Track your favourite stocks with real-time price updates and simple charts.",
      repoUrl: "https://github.com/example/stock-watchlist",
      demoUrl: "https://stocks.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 25,
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
