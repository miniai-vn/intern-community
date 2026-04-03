import Link from "next/link";
import { db } from "@/lib/db";

type LeaderboardPeriod = "week" | "month";

const periodOptions: Array<{
  value: LeaderboardPeriod;
  label: string;
  description: string;
  days: number;
}> = [
  {
    value: "week",
    label: "This week",
    description: "Top modules by votes collected in the last 7 days.",
    days: 7,
  },
  {
    value: "month",
    label: "This month",
    description: "Top modules by votes collected in the last 30 days.",
    days: 30,
  },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod: LeaderboardPeriod = period === "month" ? "month" : "week";
  const selectedPeriod =
    periodOptions.find((option) => option.value === activePeriod) ?? periodOptions[0];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - selectedPeriod.days);

  const groupedVotes = await db.vote.groupBy({
    by: ["moduleId"],
    where: {
      createdAt: { gte: cutoff },
      module: { status: "APPROVED" },
    },
    _count: { _all: true },
    orderBy: {
      _count: {
        moduleId: "desc",
      },
    },
    take: 10,
  });

  const rankedModules = groupedVotes.length
    ? await db.miniApp.findMany({
        where: {
          id: { in: groupedVotes.map((vote) => vote.moduleId) },
          status: "APPROVED",
        },
        include: {
          category: true,
          author: { select: { id: true, name: true, image: true } },
        },
      })
    : [];

  const rankMap = new Map(
    groupedVotes.map((vote) => [vote.moduleId, vote._count._all])
  );

  const leaderboard = rankedModules
    .map((module) => ({
      ...module,
      recentVotes: rankMap.get(module.id) ?? 0,
    }))
    .sort((a, b) => b.recentVotes - a.recentVotes);

  return (
    <div className="space-y-8">
      <section className="section-shell rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-50">
              Community ranking
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
                Leaderboard
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-stone-600">
                See which approved modules are getting the most attention right now.
                Rankings are based on votes received during the selected time window.
              </p>
            </div>
          </div>

          <div className="glass-panel flex flex-wrap gap-2 rounded-[1.5rem] p-3">
            {periodOptions.map((option) => (
              <Link
                key={option.value}
                href={option.value === "week" ? "/leaderboard" : `/leaderboard?period=${option.value}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  activePeriod === option.value
                    ? "bg-emerald-950 text-emerald-50"
                    : "bg-white/90 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Window" value={selectedPeriod.label} />
        <StatCard label="Modules ranked" value={`${leaderboard.length}`} />
        <StatCard
          label="Vote cutoff"
          value={cutoff.toLocaleDateString()}
        />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-stone-800">
            {selectedPeriod.label}
          </h2>
          <p className="text-sm text-stone-500">{selectedPeriod.description}</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="section-shell rounded-[1.8rem] border-dashed p-14 text-center">
            <p className="text-lg font-medium text-stone-800">
              No votes recorded in this period.
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Try switching the time window or come back after the community has cast
              more votes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leaderboard.map((module, index) => (
              <article
                key={module.id}
                className="glass-panel flex flex-col gap-4 rounded-[1.6rem] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-stone-900 text-sm font-semibold text-stone-50">
                    #{index + 1}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                        {module.category.name}
                      </span>
                      <span className="text-xs text-stone-400">
                        by {module.author.name ?? "Community member"}
                      </span>
                      <span className="text-xs text-stone-400">
                        posted {new Date(module.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <Link
                      href={`/modules/${module.slug}`}
                      className="block text-lg font-semibold text-stone-950 hover:text-emerald-900"
                    >
                      {module.name}
                    </Link>

                    <p className="line-clamp-2 text-sm leading-6 text-stone-600">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <div className="rounded-[1.4rem] border border-stone-200 bg-white/80 px-4 py-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Total votes
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-stone-950">
                      {module.voteCount}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-[1.5rem] px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
        {value}
      </p>
    </div>
  );
}
