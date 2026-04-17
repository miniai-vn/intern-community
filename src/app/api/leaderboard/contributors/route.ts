import { NextResponse } from "next/server";
import { fetchContributorLeaderboard } from "@/lib/github";

export const revalidate = 600;

export async function GET() {
  try {
    const contributors = await fetchContributorLeaderboard();
    return NextResponse.json({ contributors });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch contributor leaderboard",
      },
      { status: 500 }
    );
  }
}