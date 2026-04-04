import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { buildBrowseHref } from "@/lib/browse-url";

const MAX_SEARCH_LEN = 200;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const raw = await searchParams;
  const category = raw.category;
  const q =
    raw.q && raw.q.length > MAX_SEARCH_LEN
      ? raw.q.slice(0, MAX_SEARCH_LEN)
      : raw.q;
  const session = await auth();

  const [modules, categories] = await Promise.all([
    db.miniApp.findMany({
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
  }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: modules.map((row) => row.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((vote) => vote.moduleId));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form method="get" className="flex gap-2">
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search modules…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildBrowseHref({ q })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildBrowseHref({ q, category: cat.slug })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {q && (
            <Link
              href={buildBrowseHref({ category })}
              className="mt-2 block text-sm text-blue-600 hover:underline"
            >
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((miniApp) => (
            <ModuleCard
              key={miniApp.id}
              module={miniApp}
              hasVoted={votedIds.has(miniApp.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
