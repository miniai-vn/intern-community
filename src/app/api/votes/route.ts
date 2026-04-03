// app/api/votes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit"; // Redis sliding window

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
  // 1️⃣ Authenticate user
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 2️⃣ Rate limit check via Redis
  if (!(await checkRateLimit(userId))) {
    return NextResponse.json(
      { error: "Too many votes. Please wait a moment." },
      { status: 429 }
    );
  }

  // 3️⃣ Validate input
  const { moduleId } = await req.json();
  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  try {
    // 4️⃣ Check existing vote
    const existing = await db.vote.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });

    if (existing) {
      // 5️⃣ Un-vote
      await db.$transaction([
        db.vote.delete({ where: { id: existing.id } }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ voted: false });
    } else {
      // 6️⃣ Vote
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
    console.error("Vote error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
