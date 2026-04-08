import { Suspense } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CategoryFilter } from "@/components/category-filter";
import { SkeletonCards } from "@/components/skeleton-cards";
import { ModuleGrid } from "@/components/module-grid";

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
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Community Modules</h1>
        <p className="mt-1 text-blue-100">
          Discover mini-apps built by the Intern developer community.
        </p>

        <form className="mt-4 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search modules..."
            className="flex-1 rounded-xl border-0 bg-white/20 px-4 py-3 text-sm text-white placeholder-blue-200 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="btn-primary rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category filter with URL persistence — see TODO above */}
      <CategoryFilter categories={categories} />

      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
          <div className="text-5xl">🔍</div>
          <p className="mt-4 text-lg font-medium text-gray-700">No modules found</p>
          <p className="mt-1 text-sm text-gray-500">Try a different search or category</p>
          {q && (
            <a href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
              Clear search
            </a>
          )}
        </div>
      ) : (
        <Suspense fallback={<SkeletonCards />}>
          <ModuleGrid modules={modules} votedIds={votedIds} />
        </Suspense>
      )}
    </div>
  );
}
