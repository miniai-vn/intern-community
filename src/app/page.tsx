import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ModuleCard } from "@/components/module-card";

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
  let favoritedIds = new Set<string>();
  if (session?.user) {
    const [votes, favorites] = await Promise.all([
      db.vote.findMany({
        where: {
          userId: session.user.id,
          moduleId: { in: modules.map((m: typeof modules[number]) => m.id) },
        },
        select: { moduleId: true },
      }),
      db.favorite.findMany({
        where: {
          userId: session.user.id,
          moduleId: { in: modules.map((m: typeof modules[number]) => m.id) },
        },
        select: { moduleId: true },
      }),
    ]);
    votedIds = new Set(votes.map((v: typeof votes[number]) => v.moduleId));
    favoritedIds = new Set(favorites.map((f: typeof favorites[number]) => f.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Modules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search modules…"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-950 dark:text-blue-500 dark:hover:bg-blue-900 cursor-pointer transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category filter placeholder — see TODO above */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white dark:bg-blue-950 dark:text-blue-500 dark:hover:bg-blue-900"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:dark:bg-gray-700"
          }`}
        >
          All
        </Link>
        {categories.map((c: typeof categories[number]) => (
          <Link
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.slug
                ? "bg-blue-600 text-white dark:bg-blue-950 dark:text-blue-500 dark:hover:bg-blue-900"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:dark:bg-gray-700"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">No modules found.</p>
          {q && (
            <Link href="/" className="mt-2 block text-sm text-blue-600 hover:underline dark:text-blue-400">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module: typeof modules[number]) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedIds.has(module.id)}
              hasFavorited={favoritedIds.has(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
