import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ModulesList } from "@/components/modules-list";
import { CategoryFilter } from "@/components/category-filter";
import { SearchForm } from "@/components/search-form";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  // Fetch initial modules using API logic (same as /api/modules GET)
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
    take: 13, // +1 to detect if more items exist
  });

  // Split initial items and determine next cursor
  const hasMore = modules.length > 12;
  const initialModules = hasMore ? modules.slice(0, 12) : modules;
  const nextCursor = hasMore ? initialModules[initialModules.length - 1].id : null;

  // Fetch which modules the current user has voted on
  let votedIds: string[] = [];
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: initialModules.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = votes.map((v) => v.moduleId);
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

        <SearchForm />
      </div>

      {/* Category filter — client-side routing with useRouter */}
      <CategoryFilter categories={categories} />

      <ModulesList
        initialModules={initialModules}
        initialNextCursor={nextCursor}
        votedIds={votedIds}
        category={category}
        search={q}
      />
    </div>
  );
}
