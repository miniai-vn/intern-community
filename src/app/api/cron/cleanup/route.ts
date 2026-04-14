import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * API Endpoint serves Cronjob to delete old Rate Limit logs
 * Helps optimize database size
 */
export async function GET(req: Request) {
  // A Secret Token needs to be checked in the Header to secure this API.
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const deleted = await db.rateLimitEvent.deleteMany({
      where: {
        createdAt: { lt: twentyFourHoursAgo },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} expired rate limit logs.`,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
