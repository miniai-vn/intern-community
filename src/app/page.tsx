import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const normalizedQ = q?.trim();
  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { slug: category } } : {}),
      ...(normalizedQ
        ? {
            OR: [
              { name: { contains: normalizedQ, mode: "insensitive" } },
              { description: { contains: normalizedQ, mode: "insensitive" } },
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

  const topModules = normalizedQ ? modules.slice(0, 3) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2 items-center">
          <div className="relative">
            <input
              name="q"
              defaultValue={normalizedQ}
              placeholder="Search modules…"
              className="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {normalizedQ && (
              <a
                href={category ? `/?category=${category}` : "/"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </a>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={normalizedQ ? `/?q=${normalizedQ}` : "/"}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}${normalizedQ ? `&q=${normalizedQ}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {normalizedQ && topModules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Top results for "{normalizedQ}"
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                hasVoted={votedIds.has(module.id)}
              />
            ))}
          </div>
        </div>
      )}

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            {normalizedQ
              ? `No modules found for "${normalizedQ}".`
              : "No modules found."}
          </p>
          {normalizedQ && (
            <a
              href={category ? `/?category=${category}` : "/"}
              className="mt-2 block text-sm text-blue-600 hover:underline"
            >
              Clear search
            </a>
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