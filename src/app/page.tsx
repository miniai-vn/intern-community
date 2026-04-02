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
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm ring-1 ring-blue-50">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1f2a56]">
              Community Modules
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#58668f]">
              A minimalist directory of curated engineering tools. Built for performance, designed for clarity.
            </p>
          </div>
          <form method="GET" action="/" className="flex w-full max-w-md items-center gap-2 rounded-full bg-slate-50 px-3 py-2 shadow-sm">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search modules..."
              className="w-full border-none bg-transparent text-sm outline-none"
            />
            <button type="submit" className="sr-only">Search</button>
          </form>


        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className={`rounded-full px-4 py-1.5 font-semibold ${!category ? "bg-blue-700 text-white" : "bg-white text-slate-600 hover:bg-blue-50"}`}
            >
              All
            </a>
            {categories.map((c) => (
              <a
                key={c.id}
                href={`/?category=${c.slug}`}
                className={`rounded-full px-4 py-1.5 font-semibold ${category === c.slug ? "bg-blue-700 text-white" : "bg-white text-slate-600 hover:bg-blue-50"}`}
              >
                {c.name}
              </a>
            ))}
          </div>
          <div className="rounded-full border border-blue-200 bg-white px-3 py-1 text-sm text-blue-700">
            SORT BY Most Recent
          </div>
        </div>
      </div>


      {
        modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-12 text-center">
            <p className="text-gray-500">No modules found.</p>
            {q && (
              <a href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
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
