import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_CLEANUP_AGE_MS = 5 * 60_000;
async function checkRateLimit(
  userId: string,
): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const now = Date.now();
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS);

  const recentCount = await db.rateLimitEvent.count({
    where: {
      userId,
      action: "vote",
      createdAt: { gte: windowStart },
    },
  });

  if (recentCount >= RATE_LIMIT_MAX) {
    const oldest = await db.rateLimitEvent.findFirst({
      where: { userId, action: "vote", createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterSec = oldest
      ? Math.ceil(
          (oldest.createdAt.getTime() + RATE_LIMIT_WINDOW_MS - now) / 1000,
        )
      : 60;
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  await db.rateLimitEvent.create({
    data: { userId, action: "vote" },
  });

  if (Math.random() < 0.1) {
    const cutoff = new Date(now - RATE_LIMIT_CLEANUP_AGE_MS);
    db.rateLimitEvent
      .deleteMany({ where: { createdAt: { lt: cutoff } } })
      .catch(() => {
        /* fire-and-forget: cleanup failure is non-critical */
      });
  }

  return { allowed: true, retryAfterSec: 0 };
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const moduleId =
    body && typeof body === "object" && "moduleId" in body
      ? (body as Record<string, unknown>).moduleId
      : undefined;

  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json(
      { error: "moduleId is required and must be a string" },
      { status: 400 },
    );
  }

  const targetModule = await db.miniApp.findUnique({
    where: { id: moduleId },
    select: { id: true, status: true },
  });

  if (!targetModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (targetModule.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Voting is only allowed on approved modules" },
      { status: 403 },
    );
  }

  const { allowed, retryAfterSec } = await checkRateLimit(session.user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many votes. Max 10 per minute. Please wait." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  const { count: deletedCount } = await db.vote.deleteMany({
    where: { userId: session.user.id, moduleId },
  });

  if (deletedCount > 0) {
    await db.miniApp.update({
      where: { id: moduleId },
      data: { voteCount: { decrement: 1 } },
    });
    return NextResponse.json({ voted: false });
  }

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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return NextResponse.json({ voted: true });
    throw error;
  }
}
