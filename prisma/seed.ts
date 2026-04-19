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
    // Additional modules for pagination testing
    {
      slug: "todo-app",
      name: "Todo App",
      description:
        "Simple todo list with local storage persistence. Supports categories and due dates.",
      repoUrl: "https://github.com/example/todo-app",
      demoUrl: "https://todo.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 32,
    },
    {
      slug: "password-generator",
      name: "Password Generator",
      description:
        "Generate secure passwords with customizable options. Copy to clipboard with one click.",
      repoUrl: "https://github.com/example/password-gen",
      demoUrl: "https://passgen.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 15,
    },
    {
      slug: "calculator",
      name: "Calculator",
      description:
        "Advanced calculator with history and scientific functions. Responsive design.",
      repoUrl: "https://github.com/example/calc",
      demoUrl: "https://calc.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 28,
    },
    {
      slug: "weather-app",
      name: "Weather App",
      description:
        "Real-time weather app using OpenWeather API. Shows 7-day forecast.",
      repoUrl: "https://github.com/example/weather",
      demoUrl: "https://weather.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 22,
    },
    {
      slug: "note-taking",
      name: "Note Taking App",
      description:
        "Minimalist note-taking app with markdown support and cloud sync.",
      repoUrl: "https://github.com/example/notes",
      demoUrl: "https://notes.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 19,
    },
    {
      slug: "color-picker",
      name: "Color Picker",
      description:
        "Color picker tool with hex, RGB, and HSL formats. Generate palettes.",
      repoUrl: "https://github.com/example/color-picker",
      demoUrl: "https://colors.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 12,
    },
    {
      slug: "snake-game",
      name: "Snake Game",
      description:
        "Classic snake game with increasing difficulty levels and high score tracking.",
      repoUrl: "https://github.com/example/snake",
      demoUrl: "https://snake.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor.id,
      voteCount: 35,
    },
    {
      slug: "dice-roller",
      name: "Dice Roller",
      description:
        "Digital dice roller for tabletop games. Supports multiple dice types.",
      repoUrl: "https://github.com/example/dice",
      demoUrl: "https://dice.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "game")!.id,
      authorId: contributor.id,
      voteCount: 14,
    },
    {
      slug: "budget-planner",
      name: "Budget Planner",
      description:
        "Monthly budget planning tool with visualization and spending tracker.",
      repoUrl: "https://github.com/example/budget",
      demoUrl: "https://budget.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "finance")!.id,
      authorId: contributor.id,
      voteCount: 21,
    },
    {
      slug: "quiz-maker",
      name: "Quiz Maker",
      description:
        "Create and take quizzes with multiple choice questions and scoring.",
      repoUrl: "https://github.com/example/quiz",
      demoUrl: "https://quiz.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "social")!.id,
      authorId: contributor.id,
      voteCount: 17,
    },
    {
      slug: "timer",
      name: "Countdown Timer",
      description:
        "Customizable countdown timer with notifications and pause/resume controls.",
      repoUrl: "https://github.com/example/timer",
      demoUrl: "https://timer.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "productivity")!.id,
      authorId: contributor.id,
      voteCount: 26,
    },
    {
      slug: "text-summarizer",
      name: "Text Summarizer",
      description:
        "Summarize long texts with adjustable length and copy-to-clipboard feature.",
      repoUrl: "https://github.com/example/summarizer",
      demoUrl: "https://summary.example.com",
      status: SubmissionStatus.APPROVED,
      categoryId: categories.find((c) => c.slug === "utility")!.id,
      authorId: contributor.id,
      voteCount: 11,
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
