import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CategoryFilter } from "@/components/category-filter";
import { SearchBar } from "@/components/search-bar";
import { ModuleList } from "@/components/module-list";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// Done: Implemented multi-select category filter with URL persistence.

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string | string[] }>;
}) {
  const { q, category } = await searchParams;
  const categoriesParam = Array.isArray(category) ? category : category ? [category] : [];

  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(categoriesParam.length > 0 ? { category: { slug: { in: categoriesParam } } } : {}),
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
    orderBy: { voteCount: "desc" },
    take: 13, // Take 13 to check if there is a next page
  });

  const hasMore = modules.length > 12;
  const items = hasMore ? modules.slice(0, 12) : modules;
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

  const itemsWithVotes = items.map((m) => ({
    ...m,
    hasVoted: votedIds.has(m.id),
  }));

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Modules</h1>
          <p className="text-sm text-muted-foreground">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <SearchBar />
      </div>

      <CategoryFilter categories={categories} />

      <ModuleList
        initialItems={itemsWithVotes}
        initialCursor={nextCursor}
        searchQuery={q}
        categories={categoriesParam}
      />
    </div>
  );
}
