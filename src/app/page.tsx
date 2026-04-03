import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ModuleList } from "@/components/module-list";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

const LIMIT = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  // Fetch LIMIT + 1 so we can detect whether a next page exists.
  const raw = await db.miniApp.findMany({
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
    take: LIMIT + 1,
  });

  const hasMore = raw.length > LIMIT;
  const items = hasMore ? raw.slice(0, LIMIT) : raw;
  const initialNextCursor = hasMore ? items[items.length - 1].id : null;

  // Fetch which modules the current user has voted on.
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

  // Attach hasVoted to each item so ModuleList doesn't need a second API call.
  const initialModules = items.map((m) => ({
    ...m,
    hasVoted: votedIds.has(m.id),
  }));

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

      {/* Category filter placeholder — see TODO above */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {initialModules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {q && (
            <Link href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <ModuleList
          initialModules={initialModules}
          initialNextCursor={initialNextCursor}
          q={q}
          category={category}
        />
      )}
    </div>
  );
}
