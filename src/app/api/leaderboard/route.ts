import { NextResponse } from "next/server";
import { getMonthlyLeaderboard } from "@/lib/leaderboard";

export async function GET() {
  try {
    const leaderboard = await getMonthlyLeaderboard(10);
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
