import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ModuleCard } from "@/components/module-card";
import { FilterBar } from "@/components/filter-bar";
import { HomeSearchBar } from "@/components/home-search-bar";

const PAGE_SIZE = 9;

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page: pageParam } = await searchParams;
  const session = await auth();

  const where = {
    status: "APPROVED" as const,
    isLocked: false,
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const totalModules = await db.miniApp.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalModules / PAGE_SIZE));
  const page = Math.min(parsePage(pageParam), totalPages);

  const modules = await db.miniApp.findMany({
    where,
    // DO NOT remove include — avoids N+1 on category/author fields.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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

  function buildPageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (nextPage > 1) params.set("page", String(nextPage));
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  }

  return (
    <div className="relative -mx-4 overflow-hidden px-4 pb-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-20 top-48 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

      <section className="relative px-1 pt-8 pb-10 sm:px-3 sm:pt-10 sm:pb-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 text-center">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">
              Browse Modules
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl md:text-6xl">
              Community Modules
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
              Discover and integrate powerful modules crafted by the community.
              Enhance your workflow with productivity tools, games, and
              utilities.
            </p>
          </div>

          <HomeSearchBar initialQuery={q} />
        </div>
      </section>

      <section className="relative space-y-4 px-1 pb-10 sm:px-3">
        <div className="flex items-center justify-center gap-3">
          {category && (
            <Link
              href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
              scroll={false}
              className="text-xs font-medium text-violet-300 transition hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Clear filter
            </Link>
          )}
        </div>
        <FilterBar
          categories={categories}
          activeCategory={category}
          query={q}
        />
      </section>

      {modules.length === 0 ? (
        <div className="relative mx-1 rounded-2xl border border-dashed border-indigo-300/20 bg-slate-900/60 p-10 text-center shadow-[0_14px_40px_rgba(8,12,24,0.55)] sm:mx-3 sm:p-12">
          <h3 className="text-base font-semibold text-slate-100">
            No modules found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Try another keyword or clear your current filters.
          </p>
          {q && (
            <Link
              href={
                category ? `/?category=${encodeURIComponent(category)}` : "/"
              }
              scroll={false}
              className="mt-4 inline-flex text-sm font-medium text-violet-300 transition hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 bg-slate-900/35 px-1 py-10 sm:gap-5 sm:px-3 sm:py-12 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                hasVoted={votedIds.has(module.id)}
              />
            ))}
          </section>

          {totalPages > 1 && (
            <nav
              aria-label="Modules pagination"
              className="mx-1 mt-6 flex items-center justify-center gap-6 rounded-xl border border-indigo-300/15 bg-slate-900/60 px-4 py-3 text-sm sm:mx-3"
            >
              <Link
                href={buildPageHref(Math.max(1, page - 1))}
                scroll={false}
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-500 opacity-40"
                    : "rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-200 transition hover:border-violet-300/35 hover:text-violet-200"
                }
              >
                {"<"}
              </Link>

              <p className="text-xs text-slate-400">
                Page {page} / {totalPages}
              </p>

              <Link
                href={buildPageHref(Math.min(totalPages, page + 1))}
                scroll={false}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-500 opacity-40"
                    : "rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-200 transition hover:border-violet-300/35 hover:text-violet-200"
                }
              >
                {">"}
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
