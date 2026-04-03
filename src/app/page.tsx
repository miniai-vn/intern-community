import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilters } from "@/components/category-filters";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;//searchParams is a promise (q=abc?, category=game?) )
}) {
  const { q, category } = await searchParams;//wait for sParams from URL
  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",//only show approved modules
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },//search in name and description for the query, case insensitive
            ],
          }
        : {}),
    },
    // DO NOT remove include — avoids N+1 on category/author fields.
    include: {
      category: true,//include all category fields (id, name, slug)
      author: { select: { id: true, name: true, image: true } },//include only id, name, image of author 
    },
    orderBy: { voteCount: "desc" },//order by most voted
    take: 12,//only take 12 modules
  });

  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: modules.map((m) => m.id) },//only fetch votes for the displayed modules
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));//create a set of moduleIds that the user has voted on for easy lookup
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

        <SearchBar />
      </div>
      <CategoryFilters categories={categories} />
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {q && (
            <Link href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
            Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
