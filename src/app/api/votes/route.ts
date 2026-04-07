import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Max 10 votes per 60 seconds
const LIMIT = 10;
const WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // LOGIC RATE LIMITING (SLIDING WINDOW) 
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  // Count vote in 60 seconds from Database
  const recentVoteCount = await db.rateLimitEvent.count({
    where: {
      userId,
      key: "vote",
      timestamp: { gte: windowStart },
    },
  });

  if (recentVoteCount >= LIMIT) {
    return NextResponse.json(
      { error: "Too many votes. Please wait a minute before voting again." },
      { status: 429 }
    );
  }

  // Record the new voting event in the rate limit log.
  await db.rateLimitEvent.create({
    data: { userId, key: "vote" },
  });

  const { moduleId } = await req.json();
  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  const existing = await db.vote.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
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
        data: { userId, moduleId },
      }),
      db.miniApp.update({
        where: { id: moduleId },
        data: { voteCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ voted: true });
  }
}