import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { voteSchema } from "@/lib/validations";

// Simple in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// TODO [medium-challenge]: Replace this with a proper rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
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

  // Validate request body with Zod — rejects non-CUID strings early.
  const body = await req.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { moduleId } = parsed.data;

  // Security: only allow voting on APPROVED modules.
  // This prevents users from interacting with PENDING or REJECTED submissions
  // even if they obtain the ID from their own submission response.
  const targetModule = await db.miniApp.findUnique({
    where: { id: moduleId, status: "APPROVED" },
    select: { id: true },
  });

  if (!targetModule) {
    return NextResponse.json(
      { error: "Module not found or not available for voting" },
      { status: 404 }
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
