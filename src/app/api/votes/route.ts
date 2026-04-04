import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

function getRateLimitResetTime(userId: string): number {
  const entry = rateLimitMap.get(userId);
  if(!entry) return 0;
  const now = Date.now();
  return entry.resetAt < now ? 0 : Math.ceil((entry.resetAt - now) / 1000);
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  try {
    //1. Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //2. Rate limit check
    if (!checkRateLimit(session.user.id)) {
      const resetTime = getRateLimitResetTime(session.user.id);

      return NextResponse.json(
        { error: "Too many votes. Please wait a moment.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: resetTime,
        },
        { status: 429,
          headers: { "Retry-After": resetTime.toString() },
        }
      );
    }

    //3. Validate request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON"}, 
        { status: 400 }
      );
    }

    const { moduleId } = body;

    //4. validate moduleId
    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json(
        { 
          error: "moduleId is required and must be a string",
          code: "INVALID_MODULE_ID"
        }, 
        { status: 400 }
      );
    }

    //5. Validate moduleId format (Prisma CUID format)
    if (!/^[a-zA-Z0-9]{25}$/.test(moduleId)) {
      return NextResponse.json(
        { 
          error: "Invalid moduleId format",
          code: "INVALID_MODULE_ID"
        }, 
        { status: 400 }
      );
    }

    // 6. Check if module exists and is APPROVED
    const module = await db.miniApp.findUnique({
      where: { id: moduleId },
      select: { id: true, status: true },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found", code: "MODULE_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (module.status !== "APPROVED") {
      return NextResponse.json(
        {
          error: "Cannot vote on unapproved modules",
          code: "MODULE_NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    // 7. Check if vote already exists
    const existing = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId },
      },
    });

    // 8. Toggle vote (un-vote or vote)
    if (existing) {
      // Un-vote
      await db.$transaction([
        db.vote.delete({ where: { id: existing.id } }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ voted: false, voteCount: null });
    } else {
      // Vote
      const result = await db.$transaction([
        db.vote.create({
          data: { userId: session.user.id, moduleId },
        }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { increment: 1 } },
          select: { voteCount: true },
        }),
      ]);
      return NextResponse.json({ voted: true, voteCount: result[1].voteCount });
    }
  }catch(error){
    console.error("[/api/votes] Error:", error);

    // Check for specific Prisma errors
    if (error instanceof Error) {
      // Handle unique constraint violations (shouldn't happen with findUnique, but good practice)
      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json(
          {
            error: "Vote conflict. Please try again.",
            code: "VOTE_CONFLICT",
          },
          { status: 409 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
