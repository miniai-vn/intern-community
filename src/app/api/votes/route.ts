import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = new Date();
  const sixtySecondsAgo = new Date(now.getTime() - 60_000);

  // Use a transaction to reliably check and increment
  // For a "Medium" challenge, we can also just use two queries
  const count = await db.rateLimitEvent.count({
    where: {
      key: `vote:${userId}`,
      timestamp: { gte: sixtySecondsAgo },
    },
  });

  if (count >= 10) return false;

  await db.rateLimitEvent.create({
    data: {
      key: `vote:${userId}`,
      timestamp: now,
    },
  });

  // Optional: Background cleanup of old events for this user
  // This helps keep the table size manageable
  db.rateLimitEvent.deleteMany({
    where: {
      key: `vote:${userId}`,
      timestamp: { lt: sixtySecondsAgo },
    },
  }).catch(err => console.error("Rate limit cleanup failed:", err));

  return true;
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAllowed = await checkRateLimit(session.user.id);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Too many votes. Max 10 per minute." },
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
