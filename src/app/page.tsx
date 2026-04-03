import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CategoryFilter } from "@/components/category-filter";
import { ModuleCard } from "@/components/module-card";
import { SortSelect } from "@/components/sort-select";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;
  const session = await auth();
  const sortValue = sort === "newest" || sort === "oldest" ? sort : "top";
  const orderBy =
    sortValue === "newest"
      ? { createdAt: "desc" as const }
      : sortValue === "oldest"
        ? { createdAt: "asc" as const }
        : { voteCount: "desc" as const };

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
    // DO NOT remove include - avoids N+1 on category/author fields.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy,
    take: 12,
  });

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
    <div className="space-y-8">
      <section className="section-shell relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-300/25 via-transparent to-amber-200/30" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full border border-emerald-900/10 bg-emerald-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900">
              Curated by the community
            </span>
            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                Discover mini-app modules worth shipping.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                Browse community-built tools, games, and utilities. Review what stands
                out, upvote the useful ones, and submit your own ideas for review.
              </p>
            </div>
          </div>

          <form className="glass-panel flex w-full max-w-xl flex-col gap-3 rounded-[1.6rem] p-3 sm:flex-row">
            <label htmlFor="module-search" className="sr-only">
              Search modules
            </label>
            {category && <input type="hidden" name="category" value={category} />}
            {sortValue && <input type="hidden" name="sort" value={sortValue} />}
            <input
              id="module-search"
              name="q"
              defaultValue={q}
              placeholder="Search by module name or description"
              className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            <button
              type="submit"
              className="rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/15 hover:bg-emerald-900"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CategoryFilter categories={categories} activeCategory={category} />

        <SortSelect value={sortValue} />
      </div>

      {modules.length === 0 ? (
        <div className="section-shell rounded-[1.8rem] border-dashed p-14 text-center">
          <p className="text-lg font-medium text-stone-800">No modules found.</p>
          <p className="mt-2 text-sm text-stone-500">
            Try broadening your search or clearing the active filter.
          </p>
          {(q || category || sortValue !== "top") && (
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:text-emerald-950"
            >
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
  );
}
