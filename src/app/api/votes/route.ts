import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Robust in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// FIX [medium-challenge]: Added periodic garbage collection (sweepExpired) to prevent memory leaks in the Map.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Run cleanup every 5 minutes to sweep expired entries and prevent Map explosion
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function sweepExpired() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (entry.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
    lastCleanup = now;
  }
}

function checkRateLimit(userId: string): boolean {
  sweepExpired(); // Cleanup periodically on requests
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
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
