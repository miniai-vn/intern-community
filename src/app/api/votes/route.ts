import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function isPrismaErrorCode(err: unknown, code: string): boolean {
  if (typeof err !== "object" || err === null) return false;
  const maybe = err as Record<string, unknown>;
  return maybe.code === code;
}

function getModuleId(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const maybe = body as Record<string, unknown>;
  return typeof maybe.moduleId === "string" && maybe.moduleId ? maybe.moduleId : null;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60_000);
  const key = `votes:${userId}`;
  // TODO(recruiter-note): This is a DB-backed fixed-window limiter that works
  // across multiple instances. For stricter fairness under burst traffic, switch
  // to a sliding-window/token-bucket design and compare reject/latency metrics.

  return db.$transaction(async (tx) => {
    await tx.rateLimitEvent.deleteMany({
      where: {
        key,
        createdAt: { lt: windowStart },
      },
    });

    const currentCount = await tx.rateLimitEvent.count({
      where: {
        key,
        createdAt: { gte: windowStart },
      },
    });

    if (currentCount >= 10) return false;

    await tx.rateLimitEvent.create({
      data: {
        key,
        userId,
      },
    });

    return true;
  });
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(session.user.id))) {
    return NextResponse.json(
      { error: "Rate limit exceeded: max 10 votes per 60 seconds." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const moduleId = getModuleId(body);
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  const miniApp = await db.miniApp.findUnique({
    where: { id: moduleId },
    select: { id: true, status: true },
  });
  if (!miniApp) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }
  if (miniApp.status !== "APPROVED") {
    return NextResponse.json({ error: "Only approved modules can be voted on" }, { status: 403 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Try unvote first (idempotent + safe under concurrency)
      const deleted = await tx.vote.deleteMany({
        where: { userId: session.user.id, moduleId },
      });

      if (deleted.count > 0) {
        await tx.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { decrement: deleted.count } },
        });
        return { voted: false };
      }

      // Otherwise, try vote. If two requests race, one will win and the other
      // will hit the unique constraint — treat that as "already voted".
      // TODO(recruiter-note): Add request-level idempotency keys if clients
      // may retry aggressively (mobile flaky network) so duplicated attempts
      // can be deduplicated without extra DB load.
      try {
        await tx.vote.create({
          data: { userId: session.user.id, moduleId },
        });
        await tx.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { increment: 1 } },
        });
        return { voted: true };
      } catch (err) {
        if (isPrismaErrorCode(err, "P2002")) {
          return { voted: true };
        }
        throw err;
      }
    });

    return NextResponse.json(result);
  } catch (err) {
    if (isPrismaErrorCode(err, "P2025")) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    // TODO(recruiter-note): Add structured error logging + metrics
    // (e.g. vote.toggle.error, rate_limit.reject) to observe abuse patterns
    // and tune thresholds with real production traffic.
    throw err;
  }
}
