import { db } from "@/lib/db";

export const LEADERBOARD_LIMIT = 10;
export const DEFAULT_REVALIDATE_SECONDS = 600;

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  approvedSubmissions: number;
};

export function getCurrentUtcMonthRange(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  return {
    start: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0)),
  };
}

export function getSecondsUntilNextUtcMonth(now = new Date()) {
  const nextMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  );
  const diffSeconds = Math.floor((nextMonthStart.getTime() - now.getTime()) / 1000);
  return Math.max(1, diffSeconds);
}

export function getLeaderboardTtlSeconds(now = new Date()) {
  return Math.min(DEFAULT_REVALIDATE_SECONDS, getSecondsUntilNextUtcMonth(now));
}

export async function getMonthlyLeaderboard(limit = LEADERBOARD_LIMIT, now = new Date()) {
  const monthRange = getCurrentUtcMonthRange(now);

  const grouped = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: {
        gte: monthRange.start,
        lt: monthRange.end,
      },
    },
    _count: { id: true },
    orderBy: [{ _count: { id: "desc" } }, { authorId: "asc" }],
    take: limit,
  });

  const users = await db.user.findMany({
    where: { id: { in: grouped.map((row) => row.authorId) } },
    select: { id: true, name: true, image: true },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  const entries: LeaderboardEntry[] = grouped.map((row, idx) => {
    const user = usersById.get(row.authorId);
    return {
      rank: idx + 1,
      userId: row.authorId,
      name: user?.name ?? "Anonymous contributor",
      avatarUrl: user?.image ?? null,
      approvedSubmissions: row._count.id,
    };
  });

  return {
    monthRange,
    entries,
  };
}
