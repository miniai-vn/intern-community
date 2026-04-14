import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface TransactionResult {
  voted?: boolean;
  error?: string;
  status: number;
}

// Simple in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// TODO [medium-challenge]: Replace this with a proper rate limiter
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút
const MAX_VOTES_PER_WINDOW = 10;
async function checkRateLimit(
  userId: string,
  tx: Prisma.TransactionClient,
): Promise<{ allowed: boolean; error?: string }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  // Open an interactive transaction to ensure atomicity.

  // STEP 1: LOCK THE USER .
  // Since the Controller has checked the session, the user definitely exists in the database.
  // Force requests with the same user ID to wait for each other.
  await tx.$executeRaw`SELECT id FROM "users" WHERE id = ${userId} FOR UPDATE`;

  // STEP 2: CHECK (Sliding Window)
  const requestCount = await tx.rateLimitEvent.count({
    where: {
      userId,
      createdAt: { gte: windowStart },
    },
  });

  if (requestCount >= MAX_VOTES_PER_WINDOW) {
    return { allowed: false, error: "Too many votes. Please wait a moment." };
  }

  // STEP 3: LOG IN (This action is protected by the lock in Step 1)
  await tx.rateLimitEvent.create({
    data: { userId },
  });

  return { allowed: true };
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { moduleId } = await req.json();
  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json(
      { error: "moduleId is required" },
      { status: 400 },
    );
  }
  try {
    const finalResult = await db.$transaction(
      async (tx): Promise<TransactionResult> => {
        const limitStatus = await checkRateLimit(userId, tx);

        if (!limitStatus.allowed) {
          return { error: limitStatus.error, status: 429 };
        }

        const existing = await tx.vote.findUnique({
          where: { userId_moduleId: { userId, moduleId } },
        });

        if (existing) {
          // Un-vote
          await tx.vote.delete({ where: { id: existing.id } });
          await tx.miniApp.update({
            where: { id: moduleId },
            data: { voteCount: { decrement: 1 } },
          });
          return { voted: false, status: 200 };
        } else {
          // Vote
          await tx.vote.create({ data: { userId, moduleId } });
          await tx.miniApp.update({
            where: { id: moduleId },
            data: { voteCount: { increment: 1 } },
          });
          return { voted: true, status: 200 };
        }
      },
      { timeout: 10000 },
    );
    if (finalResult.error) {
      return NextResponse.json(
        { error: finalResult.error },
        { status: finalResult.status },
      );
    }
    return NextResponse.json({ voted: finalResult.voted });
  } catch (error: unknown) {
    console.error(
      "API VOTE ERROR:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
