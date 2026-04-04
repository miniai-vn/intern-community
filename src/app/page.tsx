import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleList } from "@/components/module-list";
import { CategoryFilter } from "@/components/category-filter";
import type { Module } from "@/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string | string[] }>;
}) {
  const { q, category } = await searchParams;

  // Support multi-select: category can be a single string or array of strings
  const selectedSlugs: string[] = category
    ? Array.isArray(category)
      ? category
      : [category]
    : [];

  const session = await auth();

  const limit = 12;
  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      // OR logic: module must belong to at least one of the selected categories
      ...(selectedSlugs.length > 0
        ? { category: { slug: { in: selectedSlugs } } }
        : {}),
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
    take: limit + 1,
  });

  const hasMore = modules.length > limit;
  const initialItems = hasMore ? modules.slice(0, limit) : modules;
  const initialCursor = hasMore ? initialItems[initialItems.length - 1].id : null;

  let votedIdsArray: string[] = [];
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: initialItems.map((m: Module) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIdsArray = votes.map((v: { moduleId: string }) => v.moduleId);
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

      {/* Category filter — multi-select OR logic, state persists in URL */}
      <Suspense
        fallback={
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-8 animate-pulse rounded-full bg-gray-200" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
        }
      >
        <CategoryFilter categories={categories} selectedSlugs={selectedSlugs} />
      </Suspense>

      {initialItems.length === 0 ? (
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
          key={`${q}-${selectedSlugs.join(",")}`}
          initialItems={initialItems}
          initialCursor={initialCursor}
          votedIds={votedIdsArray}
          q={q}
          categories={selectedSlugs}
        />
      )}
    </div>
  );
}
