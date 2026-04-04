import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { SocialCard } from "@/components/social-card";
import { Suspense } from "react";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Community Modules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search modules…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
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
        <a
          href="/"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* Main Content Grid: Modules + Social Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modules Section - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          {modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">No modules found.</p>
              {q && (
                <a href="/" className="mt-2 block text-sm text-blue-600 hover:underline dark:text-blue-400">
                  Clear search
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
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

        {/* Social Activity Sidebar - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Suspense
              fallback={
                <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <SocialCard />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
