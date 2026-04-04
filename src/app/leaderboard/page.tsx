import { unstable_cache } from "next/cache";
import Image from "next/image";
import { db } from "@/lib/db";
import type { LeaderboardEntry } from "@/app/api/leaderboard/route";

// Returns UTC boundaries for the current calendar month.
// Defined here too so the page can compute the display title without an extra fetch.
function getCurrentMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 1)),
  };
}

// Cache the DB query for 10 minutes (600 seconds) — satisfies the ISR requirement.
// The cache key includes the month so it auto-invalidates when the month rolls over.
const getCachedLeaderboard = unstable_cache(
  async (monthKey: string): Promise<LeaderboardEntry[]> => {
    const { start, end } = getCurrentMonthBounds();

    // Suppress unused-variable warning — monthKey is only used as a cache key.
    void monthKey;

    const counts = await db.miniApp.groupBy({
      by: ["authorId"],
      where: {
        status: "APPROVED",
        approvedAt: { gte: start, lt: end },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    if (counts.length === 0) return [];

    // Single user query — avoids N+1 (see Trap 3 note in PLAN.md)
    const userIds = counts.map((c) => c.authorId);
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return counts.map((c, i) => {
      const user = userMap.get(c.authorId);
      return {
        rank: i + 1,
        userId: c.authorId,
        name: user?.name ?? null,
        image: user?.image ?? null,
        approvedCount: c._count.id,
      };
    });
  },
  ["leaderboard"],
  { revalidate: 600 } // 10 minutes
);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function LeaderboardPage() {
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
  const entries = await getCachedLeaderboard(monthKey);

  const monthLabel = `${MONTH_NAMES[now.getUTCMonth()]} ${now.getUTCFullYear()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Top Contributors</h1>
        <p className="mt-1 text-sm text-gray-500">
          {monthLabel} · Ranked by approved module submissions ·{" "}
          <span className="text-gray-400">Resets at UTC midnight on the 1st</span>
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <TrophyIcon className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-gray-500">No approved submissions yet this month.</p>
          <p className="mt-1 text-sm text-gray-400">
            Submit a module and get it approved to appear here!
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.userId}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4"
            >
              <RankBadge rank={entry.rank} />

              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {entry.image ? (
                  <Image
                    src={entry.image}
                    alt={entry.name ?? "Contributor avatar"}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <DefaultAvatar />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {entry.name ?? "Anonymous"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1">
                <span className="text-sm font-bold text-blue-700">
                  {entry.approvedCount}
                </span>
                <span className="text-xs text-blue-500">
                  {entry.approvedCount === 1 ? "module" : "modules"}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-base">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base">
        🥉
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-sm font-semibold text-gray-500">
      {rank}
    </span>
  );
}

function DefaultAvatar() {
  return (
    <svg
      className="h-full w-full text-gray-300"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}
