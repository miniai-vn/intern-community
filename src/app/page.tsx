import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CategoryFilter } from "@/components/category-filter";
import { SearchBar } from "@/components/search-bar";
import { ModuleList } from "@/components/module-list";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string | string[] }>;
}) {
  const { q, category } = await searchParams;
  const categoriesParam = Array.isArray(category) ? category : category ? [category] : [];
  const limit = 12;

  const session = await auth();

  // Fetch initial modules with the same logic as the API (composite sort)
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
    orderBy: [
      { voteCount: "desc" },
      { id: "desc" },
    ],
    take: limit + 1,
  });

  const hasMore = modules.length > limit;
  const initialItems = hasMore ? modules.slice(0, limit) : modules;
  const initialNextCursor = hasMore ? initialItems[initialItems.length - 1].id : null;

  // Determine initial voting state
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: initialItems.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const items = initialItems.map(m => ({
    ...m,
    hasVoted: votedIds.has(m.id)
  }));

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Discovery</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Explore premium modules and mini-apps built by the community.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <SearchBar />
        </div>
      </div>

      <div className="space-y-12">
        <CategoryFilter categories={categories} />

        <ModuleList 
          initialItems={items} 
          initialNextCursor={initialNextCursor} 
          searchQuery={q}
          categories={categoriesParam}
        />
      </div>
    </div>
  );
}
