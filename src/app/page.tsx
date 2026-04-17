import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import Link from "next/link";

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
            Community Modules
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search modules…"
              className="relative w-full rounded-xl border border-border bg-surface-raised pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors duration-150 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-black shadow-sm shadow-amber-500/20 transition-colors duration-150 hover:bg-amber-400"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
            !category
              ? "bg-amber-500 text-black shadow-sm shadow-amber-500/25"
              : "border border-border bg-surface-raised text-text-secondary hover:border-border-strong"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              category === c.slug
                ? "bg-amber-500 text-black shadow-sm shadow-amber-500/25"
                : "border border-border bg-surface-raised text-text-secondary hover:border-border-strong"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-16 text-center">
          <p className="font-display text-lg text-text-secondary">No modules found</p>
          {q && (
            <Link href="/" className="mt-3 block text-sm text-amber-400 hover:underline">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" />
      <path d="M9.5 9.5 L13 13" />
    </svg>
  );
}