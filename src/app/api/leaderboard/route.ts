import { NextResponse } from "next/server";
import {
  getCurrentMonthLeaderboard,
} from "@/lib/leaderboard";

export const revalidate = 600;

// GET /api/leaderboard — top contributors for the current UTC month
export async function GET() {
  const leaderboard = await getCurrentMonthLeaderboard();
  return NextResponse.json(leaderboard);
}
