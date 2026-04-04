import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  approvedCount: number;
}

// Returns UTC boundaries for the current calendar month.
// e.g. April 2026 → [2026-04-01T00:00:00Z, 2026-05-01T00:00:00Z)
function getCurrentMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 1)),
  };
}

// GET /api/leaderboard — top 10 contributors for the current UTC calendar month
export async function GET() {
  const { start, end } = getCurrentMonthBounds();

  // Step 1: aggregate approved counts per author for this month.
  // Uses the (status, approvedAt) composite index on mini_apps.
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

  if (counts.length === 0) {
    return NextResponse.json({ entries: [], month: start.toISOString() });
  }

  // Step 2: fetch user details in a single query — avoids N+1.
  const userIds = counts.map((c) => c.authorId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const entries: LeaderboardEntry[] = counts.map((c, i) => {
    const user = userMap.get(c.authorId);
    return {
      rank: i + 1,
      userId: c.authorId,
      name: user?.name ?? null,
      image: user?.image ?? null,
      approvedCount: c._count.id,
    };
  });

  return NextResponse.json({ entries, month: start.toISOString() });
}
