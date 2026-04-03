import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// In production for high scale, a Redis-backed window (e.g. Upstash) is better, 
// but for normal loads, a fast postgres table avoids adding extra infrastructure dependencies.

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Rate limiting: sliding window using Postgres
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const recentVotes = await db.rateLimitEvent.count({
    where: {
      userId,
      action: "VOTE",
      createdAt: { gte: oneMinuteAgo },
    },
  });

  if (recentVotes >= 10) {
    return NextResponse.json(
      { error: "Too many votes. Please wait a moment." },
      { status: 429 }
    );
  }

  // Record this attempt
  await db.rateLimitEvent.create({
    data: { userId, action: "VOTE" },
  });

  // Asynchronously clean up old events (best effort, unawaited)
  db.rateLimitEvent.deleteMany({
    where: {
      createdAt: { lt: new Date(Date.now() - 120_000) }, // Prune events older than 2 minutes
    },
  }).catch(() => {});

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
