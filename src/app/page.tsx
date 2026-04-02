import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { SearchInput } from "@/components/search-input";

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
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  const trendingModules = await db.miniApp.findMany({
    where: { status: "APPROVED" },
    orderBy: { voteCount: "desc" },
    take: 3,
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: {
          in: [...modules, ...trendingModules].map((m) => m.id),
        },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Community Modules
          </h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2">
          <SearchInput initialValue={q} />
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 hover:shadow">
            Search
          </button>
        </form>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/"
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${!category
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          All
        </a>

        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${category === c.slug
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* TRENDING */}
      {!category && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Trending
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingModules.map((module, index) => (
              <div
                key={module.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Rank badge */}
                <div className="absolute -top-3 -left-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                  #{index + 1}
                </div>

                {/* Title */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                    {module.name}
                  </h3>

                  {module.demoUrl && (
                    <a
                      href={module.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ↗
                    </a>
                  )}
                </div>

                {/* Description */}
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {module.description}
                </p>

                {/* Bottom */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {module.category.name}
                  </span>

                  <span className="text-xs font-medium text-gray-500">
                    ▲ {module.voteCount}
                  </span>
                </div>

                {/* Hover overlay nhẹ */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-blue-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          All Modules
        </h2>

        {modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No modules found.</p>
            {q && (
              <a
                href="/"
                className="mt-2 block text-sm text-blue-600 hover:underline"
              >
                Clear search
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="transition hover:-translate-y-1 hover:shadow-md"
              >
                <ModuleCard
                  module={module}
                  hasVoted={votedIds.has(module.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}