import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ratelimit } from "@/lib/ratelimit";
// Simple in-memory rate limit: max 10 votes per minute per user.
// In production, replace with Redis-backed sliding window (e.g. Upstash).
// TODO [medium-challenge]: Replace this with a proper rate limiter

// POST /api/votes — toggle vote on a module
export const runtime = "nodejs"; // 👉 tránh lỗi Edge

export async function POST(req: NextRequest) {
  try {
    // 🔐 Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 🚦 Rate limit (safe wrapper)
    let allowed = true;

    try {
      const { success } = await ratelimit.limit(userId);
      allowed = success;
    } catch (err) {
      console.error("Rate limit error:", err);
      // 👉 fallback: cho qua nếu Redis fail (production choice)
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many votes. Max 10 per minute." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        },
      );
    }

    // 📦 Parse body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { moduleId } = body;

    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json(
        { error: "moduleId is required" },
        { status: 400 },
      );
    }

    // 🔍 Check existing vote
    const existing = await db.vote.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });

    // 🔁 Toggle vote
    if (existing) {
      // ❌ Un-vote
      await db.$transaction([
        db.vote.delete({ where: { id: existing.id } }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ voted: false });
    } else {
      // ✅ Vote
      await db.$transaction([
        db.vote.create({
          data: { userId, moduleId },
        }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ voted: true });
    }
  } catch (err) {
    console.error("POST /api/votes error:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
