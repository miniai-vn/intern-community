import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// DB-backed sliding window rate limit
// Resolves issue of in-memory maps failing across multiple processes.
// Note: Can also run a cronjob to clear old entries from `RateLimitEvent` to save space.
async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60_000);

  const reqCount = await db.rateLimitEvent.count({
    where: {
      userId,
      action: "VOTE",
      createdAt: { gte: windowStart },
    },
  });

  if (reqCount >= 10) return false;

  await db.rateLimitEvent.create({
    data: {
      userId,
      action: "VOTE",
    },
  });

  return true;
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
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
}
