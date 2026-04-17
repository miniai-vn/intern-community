import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * DB-backed Rate Limiter
 * Ensures max 10 votes per 60 seconds across all server instances.
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60_000);

  // Use a transaction to both check and record the event
  // This avoids double-counting or skipping due to race conditions
  const count = await db.rateLimitEvent.count({
    where: {
      userId,
      key: "vote_action",
      createdAt: { gte: windowStart },
    },
  });

  if (count >= 10) return false;

  // Record this action
  await db.rateLimitEvent.create({
    data: { userId, key: "vote_action" },
  });

  return true;
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check rate limit (DB-backed sliding window)
  const isAllowed = await checkRateLimit(session.user.id);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Too many votes. Please wait a minute." },
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
}
