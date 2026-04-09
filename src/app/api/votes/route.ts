import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * DB-backed rate limiter — works across multiple server instances.
 * Counts recent RateLimitEvent rows for this user+action within the window.
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const count = await db.rateLimitEvent.count({
    where: {
      userId,
      action: "vote",
      createdAt: { gte: windowStart },
    },
  });

  if (count >= RATE_LIMIT_MAX) return false;

  await db.rateLimitEvent.create({
    data: { userId, action: "vote" },
  });

  return true;
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const moduleId =
    typeof body === "object" && body !== null && "moduleId" in body
      ? (body as Record<string, unknown>).moduleId
      : undefined;

  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json(
      { error: "moduleId is required and must be a string" },
      { status: 400 }
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
