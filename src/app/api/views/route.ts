import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/views — record a module page view
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { moduleId } = body;

  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json(
      { error: "moduleId is required" },
      { status: 400 },
    );
  }

  // Verify module exists and is approved
  const miniApp = await db.miniApp.findUnique({
    where: { id: moduleId, status: "APPROVED" },
    select: { id: true },
  });

  if (!miniApp) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Deduplicate: one tracked view per user per module per day (logged-in users only)
  if (userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await db.moduleView.findFirst({
      where: {
        userId,
        moduleId,
        viewedAt: { gte: startOfDay },
      },
    });

    if (existing) {
      return NextResponse.json({
        tracked: false,
        reason: "already_viewed_today",
      });
    }
  }

  // Record view and increment denormalized counter atomically
  await db.$transaction([
    db.moduleView.create({
      data: { userId, moduleId },
    }),
    db.miniApp.update({
      where: { id: moduleId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ tracked: true });
}
