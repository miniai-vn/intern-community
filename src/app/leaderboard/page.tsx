import { getMonthlyLeaderboard } from "@/lib/leaderboard";

export const revalidate = 600;

function formatUtcMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={`${name} avatar`}
        className="h-10 w-10 rounded-full border border-gray-200 object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-500"
      aria-label={`${name} avatar`}
      title="Default avatar"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M4.5 19.5c1.8-3 4.3-4.5 7.5-4.5s5.7 1.5 7.5 4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function getRankBadgeClass(rank: number) {
  if (rank === 1) return "bg-amber-100 text-amber-800 border-amber-200";
  if (rank === 2) return "bg-slate-100 text-slate-700 border-slate-200";
  if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function getRowHighlightClass(rank: number) {
  if (rank === 1) return "bg-amber-50/60";
  if (rank === 2) return "bg-slate-50/70";
  if (rank === 3) return "bg-orange-50/70";
  return "";
}

export default async function LeaderboardPage() {
  const now = new Date();
  const { monthRange, entries } = await getMonthlyLeaderboard(undefined, now);
  const monthLabel = formatUtcMonth(monthRange.start);
  const totalApproved = entries.reduce((sum, entry) => sum + entry.approvedSubmissions, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Monthly Leaderboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Top Contributors
            </h1>
            <p className="text-sm text-gray-500">
              Ranked by approved module submissions in <span className="font-medium">{monthLabel}</span>{" "}
              (UTC).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Contributors shown</p>
              <p className="text-xl font-semibold text-gray-900">{entries.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Total approved</p>
              <p className="text-xl font-semibold text-gray-900">{totalApproved}</p>
            </div>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          No approved submissions yet for this month.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[88px_1fr_auto] border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-5">
            <span>Rank</span>
            <span>Contributor</span>
            <span>Approved</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <li
                key={entry.userId}
                className={`grid grid-cols-[88px_1fr_auto] items-center gap-4 px-4 py-3 sm:px-5 ${getRowHighlightClass(
                  entry.rank
                )}`}
              >
                <div>
                  <span
                    className={`inline-flex min-w-[52px] items-center justify-center rounded-full border px-2.5 py-1 text-sm font-semibold ${getRankBadgeClass(
                      entry.rank
                    )}`}
                  >
                    #{entry.rank}
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={entry.name} avatarUrl={entry.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-500">Community contributor</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-gray-900">{entry.approvedSubmissions}</p>
                  <p className="text-xs text-gray-500">approved</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
