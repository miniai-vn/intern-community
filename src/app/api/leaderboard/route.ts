import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOP_N = 10;
const CACHE_TTL = 600;
const STATUS_APPROVED = "APPROVED";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  approvedCount: number;
}

function getCurrentMonthUTC() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { startOfMonth, startOfNextMonth };
}

function assignRanks(items: { authorId: string; count: number }[]): LeaderboardEntry[] {
  let currentRank = 0;
  let lastScore: number | null = null;
  return items.map((item, index) => {
    if (item.count !== lastScore) {
      currentRank = index + 1;
      lastScore = item.count;
    }
    return {
      rank: currentRank,
      userId: item.authorId,
      name: null,
      image: null,
      approvedCount: item.count,
    };
  });
}

export async function GET() {
  try {
    const { startOfMonth, startOfNextMonth } = getCurrentMonthUTC();

    const aggregations = await db.miniApp.groupBy({
      by: ["authorId"],
      where: {
        status: STATUS_APPROVED,
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _count: { authorId: true },
      orderBy: { _count: { authorId: "desc" } },
      take: TOP_N,
    });

    if (aggregations.length === 0) {
      return NextResponse.json([]);
    }

    const normalized = aggregations.map((item) => ({
      authorId: item.authorId,
      count: item._count.authorId,
    }));

    const ranked = assignRanks(normalized);
    const userIds = ranked.map((item) => item.userId);
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard: LeaderboardEntry[] = ranked.map((item) => {
      const user = userMap.get(item.userId);
      return { ...item, name: user?.name ?? null, image: user?.image ?? null };
    });

    return NextResponse.json(leaderboard, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
      },
    });
  } catch (error) {
    console.error("[Leaderboard API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}