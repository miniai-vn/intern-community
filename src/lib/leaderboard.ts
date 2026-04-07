import { db } from "@/lib/db";
import type { LeaderboardEntry, LeaderboardResult } from "@/types";

function getCurrentUtcMonthRange(now = new Date()): {
  monthStart: Date;
  nextMonthStart: Date;
} {
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
  const nextMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  );

  return { monthStart, nextMonthStart };
}

export async function getMonthlyLeaderboard(limit = 10): Promise<LeaderboardResult> {
  const { monthStart, nextMonthStart } = getCurrentUtcMonthRange();

  const grouped = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    _count: {
      id: true,
    },
    // Tie-breaker: if approved counts are equal, contributor with the earliest
    // approved submission in the current UTC month ranks higher.
    orderBy: [
      { _count: { id: "desc" } },
      { _min: { createdAt: "asc" } },
      { authorId: "asc" },
    ],
    take: limit,
  });

  const authorIds = grouped.map((row) => row.authorId);
  const users = authorIds.length
    ? await db.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, image: true },
      })
    : [];

  const usersById = new Map(users.map((user) => [user.id, user]));

  const items = grouped.map((row, index) => {
    const user = usersById.get(row.authorId);

    return {
      rank: index + 1,
      userId: row.authorId,
      name: user?.name?.trim() || "Anonymous Contributor",
      image: user?.image ?? null,
      approvedSubmissions: row._count.id,
    } satisfies LeaderboardEntry;
  });

  return {
    monthStartUtc: monthStart.toISOString(),
    nextMonthStartUtc: nextMonthStart.toISOString(),
    generatedAtUtc: new Date().toISOString(),
    items,
  };
}
