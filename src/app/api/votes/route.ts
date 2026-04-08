import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Sliding Window Rate Limiter
 *
 * Instead of a fixed window (reset at fixed time), this uses a sliding window
 * algorithm — counts requests in the last WINDOW_MS milliseconds.
 *
 * Each user has a list of request timestamps.
 * When checking, we:
 * 1. Remove timestamps older than WINDOW_MS
 * 2. Count remaining timestamps
 * 3. If count < limit → allow + add current timestamp
 * 4. If count >= limit → deny
 *
 * Advantages over fixed window:
 * - More accurate (no burst at window boundaries)
 * - Fairer for users at window edges
 */
const WINDOW_MS = 60_000; // 1 minute sliding window
const MAX_REQUESTS = 10;   // max 10 votes per minute per user

// Map: userId → array of timestamps (in milliseconds)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Get existing timestamps for this user
  let timestamps = rateLimitMap.get(userId) ?? [];

  // Remove timestamps outside the sliding window
  timestamps = timestamps.filter((ts) => ts > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    // Rate limit exceeded
    return false;
  }

  // Allow this request — add current timestamp
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
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
