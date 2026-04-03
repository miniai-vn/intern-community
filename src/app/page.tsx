import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";


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

  // Ensure only one module per category is displayed (avoid duplicates like two Game/Utility cards)
  const uniqueModules = Array.from(
    modules.reduce((map, m) => {
      if (!map.has(m.category.slug)) map.set(m.category.slug, m);
      return map;
    }, new Map<string, typeof modules[number]>()).values()
  );

  const displayedModules = uniqueModules;
  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: displayedModules.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-lg ring-1 ring-blue-50">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">
              Community Modules
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              A minimalist directory of curated engineering tools. Built for performance, designed for clarity.
            </p>
          </div>
          <form method="GET" action="/" className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow min-w-0 flex-shrink-0">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search modules..."
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400 min-w-0"
            />
            <button type="submit" className="sr-only">Search</button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className={`rounded-full px-4 py-2 font-semibold text-sm transition-all duration-200 ${!category
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                }`}
            >
              All
            </a>
            {categories.map((c) => (
              <a
                key={c.id}
                href={`/?category=${c.slug}`}
                className={`rounded-full px-4 py-2 font-semibold text-sm transition-all duration-200 ${category === c.slug
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  }`}
              >
                {c.name}
              </a>
            ))}
          </div>

        </div>
      </div>
      {
        modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No modules found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search or browse all categories.</p>
            {q && (
              <a href="/" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear search
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                hasVoted={votedIds.has(module.id)}
              />
            ))}
          </div>
        )
      }

    </div >
  );
}
