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
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-surface px-6 py-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Community <span className="text-accent">Modules</span>
        </h1>
        <p className="mt-2 text-muted">
          Discover mini-apps built by the Intern developer community.
        </p>

        {/* Search */}
        <form className="mt-5 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search modules…"
            className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/"
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            !category
              ? "bg-accent text-accent-fg shadow-sm"
              : "bg-surface-2 text-muted hover:bg-accent-subtle hover:text-accent-subtle-fg"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              category === c.slug
                ? "bg-accent text-accent-fg shadow-sm"
                : "bg-surface-2 text-muted hover:bg-accent-subtle hover:text-accent-subtle-fg"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* Module grid */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="text-muted">No modules found.</p>
          {q && (
            <a href="/" className="mt-3 block text-sm font-medium text-accent hover:underline">
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
