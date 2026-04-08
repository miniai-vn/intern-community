import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Create a SHA-256 hash of the visitor's IP + User-Agent.
 * This fingerprint is used to deduplicate anonymous views without storing PII.
 */
async function hashFingerprint(ip: string, ua: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:${ua}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Deduplicate: one tracked view per user per module per day (logged-in users)
  if (userId) {
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

  // Deduplicate anonymous visitors by IP fingerprint (hashed, no raw IP stored)
  let ipHash: string | null = null;
  if (!userId) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const ua = req.headers.get("user-agent") ?? "unknown";
    ipHash = await hashFingerprint(ip, ua);

    const existing = await db.moduleView.findFirst({
      where: {
        ipHash,
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
      data: { userId, moduleId, ipHash },
    }),
    db.miniApp.update({
      where: { id: moduleId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ tracked: true });
}
