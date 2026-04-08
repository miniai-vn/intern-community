import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Simple in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// TODO [medium-challenge]: Replace this with a proper rate limiter
async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60_0000); // 1 minute ago

  const voteCount = await db.rateLimitEvent.count({
    where: {
      userId,
      createdAt: { gte: windowStart },
    },
  });
  
  // Reach Limit -> Block
  if (voteCount >= 10) {
    return false;
  }
  // Not Reach Limit -> Allow + Record Event
  await db.rateLimitEvent.create({
    data: { userId: userId },
  });
  
  return true;
 
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
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
