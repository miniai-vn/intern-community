import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { CategoryFilter } from "@/components/category-filter";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string | string[]; category?: string | string[] };
}) {
  const { q, category } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const selectedCategory = Array.isArray(category) ? category[0] : category;
  const normalizedQuery = typeof query === "string" ? query.trim() : undefined;
  const normalizedCategory =
    typeof selectedCategory === "string" && selectedCategory.trim().length > 0
      ? selectedCategory.trim()
      : undefined;

  const session = await auth();

  const limit = 12;
  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(normalizedCategory ? { category: { slug: normalizedCategory } } : {}),
      ...(normalizedQuery
        ? {
            OR: [
              { name: { contains: normalizedQuery, mode: "insensitive" } },
              { description: { contains: normalizedQuery, mode: "insensitive" } },
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
    take: limit + 1,
  });

  const hasMore = modules.length > limit;
  const items = hasMore ? modules.slice(0, limit) : modules;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: items.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2">
          {/* If a category is active, preserve it in the search params */}
          {category && (
            <input type="hidden" name="category" value={category} />
          )}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search modules…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category filter placeholder — see TODO above */}
      <CategoryFilter categories={categories} />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {q && (
            <Link
              href="/"
              className="mt-2 block text-sm text-blue-600 hover:underline"
            >
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((module) => (
            <li
              key={module.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/modules/${module.slug}`}
                  className="text-base font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                >
                  {module.name}
                </Link>
                {module.demoUrl && (
                  <a
                    href={module.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open demo for ${module.name} module`}
                    className="shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    Demo
                  </a>
                )}
              </div>

              <p className="line-clamp-2 text-sm text-gray-600">{module.description}</p>

              <div className="mt-auto flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {module.category.name}
                </span>
                <span className="text-sm font-medium text-gray-700">{module.voteCount} votes</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
