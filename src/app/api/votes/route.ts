import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { voteRatelimit } from "@/lib/rate-limit";

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting: max 10 votes per user per 60-second sliding window.
  // Uses Upstash Redis so the limit is shared across all server instances.
  // Falls back to allowing the request when Upstash is not configured
  // (e.g. local dev without credentials).
  if (voteRatelimit) {
    const { success, limit, remaining, reset } = await voteRatelimit.limit(
      session.user.id
    );

    if (!success) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many votes. You can cast at most ${limit} votes per minute. Please wait ${retryAfterSeconds}s before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
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
