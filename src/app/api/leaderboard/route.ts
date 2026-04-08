import { NextResponse } from "next/server";
import { getLeaderboardTtlSeconds, getMonthlyLeaderboard } from "@/lib/leaderboard";

export async function GET() {
  const now = new Date();
  const ttlSeconds = getLeaderboardTtlSeconds(now);
  const { monthRange, entries } = await getMonthlyLeaderboard(undefined, now);

  return NextResponse.json(
    {
      month: {
        startUtc: monthRange.start.toISOString(),
        endUtcExclusive: monthRange.end.toISOString(),
      },
      entries,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=59`,
      },
    }
  );
}
