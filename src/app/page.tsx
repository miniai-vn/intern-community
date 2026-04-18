import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { CategoryFilter } from "@/components/category-fillter";

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
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: [
      { voteCount: "desc" },
      { id: "desc" }, // 👈 FIX quan trọng
    ],
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
    <div className="space-y-8 py-6">
      {/* Header & Search Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Community Modules
          </h1>
          <p className="text-sm text-gray-400">
            Discover mini-apps built by the <span className="text-blue-400">Intern developer community</span>.
          </p>
        </div>

        <form className="flex w-full max-w-sm gap-2">
          <div className="relative w-full">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search modules…"
              className="w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
            />
            <kbd className="absolute right-3 top-2.5 hidden rounded border border-gray-800 bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 sm:block">
              /
            </kbd>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category filter section */}
      <div className="flex flex-wrap gap-2 border-y border-gray-800/50 py-4">
        <CategoryFilter categories={categories} />
      </div>

      {/* Content Section */}
      {modules.length === 0 ? (
        <div className="group relative rounded-2xl border border-dashed border-gray-800 bg-gray-900/20 p-16 text-center transition-all hover:border-gray-700">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 ring-1 ring-gray-800">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-400">No modules found.</p>
          <p className="mt-1 text-sm text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>

          {q && (
            <a
              href={`/?${category ? `category=${category}` : ""}`}
              className="mt-6 inline-block rounded-lg border border-gray-800 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-gray-800 hover:text-blue-300"
            >
              Clear all search
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div key={module.id} className="transition-transform duration-300 hover:-translate-y-1">
              <ModuleCard
                module={module}
                hasVoted={votedIds.has(module.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
