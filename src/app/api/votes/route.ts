import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emitNotificationToUser } from "@/lib/notification-realtime";

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

  if (session.user.isLocked) {
    return NextResponse.json(
      { error: "Your account is locked. Voting is disabled." },
      { status: 403 },
    );
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
    const module = await db.miniApp.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        name: true,
        slug: true,
        authorId: true,
        isLocked: true,
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (module.isLocked) {
      return NextResponse.json(
        { error: "This module is locked and cannot receive votes." },
        { status: 403 },
      );
    }

    const notification = await db.$transaction(async (tx) => {
      await tx.vote.create({
        data: { userId: session.user.id, moduleId },
      });
      await tx.miniApp.update({
        where: { id: moduleId },
        data: { voteCount: { increment: 1 } },
      });

      if (module.authorId === session.user.id) {
        return null;
      }

      return tx.notification.create({
        data: {
          userId: module.authorId,
          type: "MODULE_LIKED",
          title: "Your module got a new like",
          message: `Someone liked ${module.name}.`,
          link: `/modules/${module.slug}`,
        },
      });
    });

    if (notification) {
      emitNotificationToUser(module.authorId, notification);
    }

    return NextResponse.json({ voted: true });
  }
}
