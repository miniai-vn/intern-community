import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Check rate limit using sliding window in PostgreSQL
// Max 10 votes per user per 60-second window
async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const now = new Date();
    const sixtySecondsAgo = new Date(now.getTime() - 60_000);

    // Count votes in the last 60 seconds
    const recentEvents = await db.rateLimitEvent.count({
      where: {
        userId,
        action: "vote",
        createdAt: {
          gte: sixtySecondsAgo,
        },
      },
    });

    // Allow if under limit
    if (recentEvents < 10) {
      // Record this event for future rate limit checks
      await db.rateLimitEvent.create({
        data: {
          userId,
          action: "vote",
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the vote (fail open)
    // Better to let users vote than to block them with a server error
    return true;
  }
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkRateLimit(session.user.id))) {
      return NextResponse.json(
        { error: "Too many votes. Please wait a moment." },
        { status: 429 }
      );
    }

    const { moduleId } = await req.json();
    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    const existing = await db.vote.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId } },
    });

    if (existing) {
      // Un-vote
      await db.$transaction([
        db.vote.delete({ where: { id: existing.id } }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ voted: false });
    } else {
      // Vote
      await db.$transaction([
        db.vote.create({
          data: { userId: session.user.id, moduleId },
        }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ voted: true });
    }
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
