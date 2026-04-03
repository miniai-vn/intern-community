import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import Link from "next/link";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    // DO NOT remove include — avoids N+1 on category/author fields.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: modules.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION AS CARD ===== */}
      <div className="relative z-10 px-4 sm:px-0 pt-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg overflow-hidden mb-12">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-8 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  🎯 Community Modules
                </h1>
                <p className="text-slate-300 text-lg">
                  Discover mini-apps built by the Intern developer community.
                </p>
              </div>

              {/* Tools Button */}
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 transition-all whitespace-nowrap"
              >
                <span>🛠️</span>
                <span>Developer Tools</span>
              </Link>
            </div>
          </div>

          {/* Card Content */}
          <div className="px-8 py-6">
            {/* Search Form */}
            <form className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search modules…"
                className="flex-1 rounded-lg bg-slate-700/50 px-4 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 transition"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-medium text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 space-y-6 py-8 px-4 sm:px-0">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !category
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                : "bg-slate-800 text-slate-300 hover:text-slate-100"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                category === c.slug
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "bg-slate-800 text-slate-300 hover:text-slate-100"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Modules Grid or Empty State */}
        {modules.length === 0 ? (
          <div className="rounded-xl p-12 text-center bg-slate-800/50">
            <p className="text-slate-200 text-lg font-medium mb-3">📭 No modules found</p>
            <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
            {q && (
              <Link href="/" className="inline-block text-sm text-purple-400 hover:text-purple-300 font-medium">
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                hasVoted={votedIds.has(module.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
