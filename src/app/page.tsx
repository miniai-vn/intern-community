import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SearchForm } from "@/components/search-form";
import { CategoryFilter } from "@/components/category-filter";
import { PaginatedModules } from "@/components/paginated-modules";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const whereCondition: any = {
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
  };

  const totalCount = await db.miniApp.count({ where: whereCondition });

  const initialModules = await db.miniApp.findMany({
    where: whereCondition,
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 3,
  });

  const initialTotalPages = Math.ceil(totalCount / 3);

  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: initialModules.map((m: any) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v: any) => v.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  // Add hasVoted to initial modules
  const initialItemsWithVote = initialModules.map((m: any) => ({
    ...m,
    hasVoted: votedIds.has(m.id),
  }));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-8 py-10 text-white shadow-2xl shadow-indigo-600/20">
        {/* Decorative orbs */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm sm:text-4xl">
              Community Modules
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-indigo-100">
              Discover mini-apps built by the Intern developer community. Vote for your
              favorites, submit your own creations, and explore.
            </p>
          </div>
          <SearchForm initialQuery={q} />
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter categories={categories} defaultCategory={category} />

      {/* Module Grid */}
      {initialItemsWithVote.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-600">No modules found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
          {q && (
            <a
              href="/"
              className="mt-4 inline-block rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              Clear search
            </a>
          )}
        </div>
      ) : (
        <PaginatedModules
          initialItems={initialItemsWithVote}
          initialTotalPages={initialTotalPages}
          q={q}
          category={category}
        />
      )}
    </div>
  );
}
