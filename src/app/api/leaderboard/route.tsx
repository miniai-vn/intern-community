import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData, setCachedData } from "@/lib/redis";

const LEADERBOARD_CACHE_KEY = "modules:popular:leaderboard";
const CACHE_TTL = 600; // 10 minutes

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  approvedCount: number;
}

function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const endOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );

  return { startOfMonth, endOfMonth };
}

async function fetchLeaderboardFromDB(): Promise<LeaderboardEntry[]> {
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();

  console.log("[Cache MISS] Fetching leaderboard from database");

  // Single optimized query with JOIN
  const results = await db.$queryRaw<
    Array<{
      rank: number;
      userId: string;
      name: string | null;
      image: string | null;
      approvedCount: number;
    }>
  >`
      WITH ranked AS (
      SELECT
        u.id AS "userId",
        u.name,
        u.image,
        COUNT(ma.id)::int AS "approvedCount"
      FROM users u
      INNER JOIN mini_apps ma ON u.id = ma."authorId"
      WHERE ma.status = 'APPROVED'
        AND ma."createdAt" >= ${startOfMonth}
        AND ma."createdAt" <= ${endOfMonth}
      GROUP BY u.id, u.name, u.image
      )
      SELECT
        ROW_NUMBER() OVER (ORDER BY "approvedCount" DESC) AS rank,
        *
      FROM ranked
      ORDER BY "approvedCount" DESC
      LIMIT 10;
  `;

  return results
    .map((entry) => ({
      ...entry,
      rank: Number(entry.rank),
      approvedCount: Number(entry.approvedCount),
    }))
    .filter((entry) => entry.approvedCount > 0);
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Attempt to fetch from Redis
  const cached = await getCachedData<LeaderboardEntry[]>(
    LEADERBOARD_CACHE_KEY
  );
  if (cached) {
    console.log("[Cache HIT] Leaderboard from Redis");
    return cached;
  }

  try {
    // Fetch from database
    const leaderboard = await fetchLeaderboardFromDB();

    // Update Redis cache
    console.log(
      "[Cache UPDATE] Storing leaderboard in Redis with TTL:",
      CACHE_TTL
    );
    await setCachedData(LEADERBOARD_CACHE_KEY, leaderboard, CACHE_TTL);

    return leaderboard;
  } catch (dbError) {
    console.error("Database query failed:", dbError);
    throw new Error("Failed to fetch leaderboard data");
  }
}

export async function GET(request: NextRequest) {
  try {
    const leaderboard = await getLeaderboard();

    return NextResponse.json(leaderboard, {
      headers: {
        "Cache-Control":
          "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

export const revalidate = 600; // ISR: revalidate every 10 minutes