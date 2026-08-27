import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { voteRatelimit } from "@/lib/rate-limit";

// Simple in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// TODO [medium-challenge]: Replace this with a proper rate limiter

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = `user:${session.user.id}`;
  const { success, limit, remaining, reset } =
    await voteRatelimit.limit(identifier);

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded: max 10 votes per 60 seconds.",
        limit,
        remaining,
        reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  // Verify module exists and is APPROVED
  const targetModule = await db.miniApp.findUnique({
    where: { id: moduleId },
    select: { id: true, status: true },
  });

  if (!targetModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (targetModule.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Can only vote on approved modules" },
      { status: 403 }
    );
  }

  // Rate limit check (DB-backed)
  if (!(await checkRateLimit(session.user.id))) {
    return NextResponse.json(
      { error: "Too many votes. Please wait a moment." },
      { status: 429 }
    );
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
    // Vote — handle race condition where two concurrent requests
    // both pass the findUnique check and try to create simultaneously.
    try {
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
    } catch (error: unknown) {
      // P2002 = unique constraint violation — treat as already voted
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        return NextResponse.json({ voted: true });
      }
      throw error;
    }
  }
}
