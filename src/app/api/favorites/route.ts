import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Simple in-memory rate limit: max 5 favorites per minute per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;

  // Cleanup old entries to prevent unbounded memory growth
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  return true;
}

// POST /api/favorites — toggle favorite on a module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { moduleId } = await req.json();
  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json(
      { error: "Invalid moduleId: must be a non-empty string" },
      { status: 400 }
    );
  }

  // Validate that moduleId exists and is APPROVED before allowing favorite
  const miniApp = await db.miniApp.findUnique({
    where: { id: moduleId },
  });
  if (!miniApp || miniApp.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Module not found or not approved" },
      { status: 404 }
    );
  }

  const existing = await db.favorite.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
  });

  if (existing) {
    // Un-favorite
    await db.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    // Favorite
    await db.favorite.create({
      data: { userId: session.user.id, moduleId },
    });
    return NextResponse.json({ favorited: true });
  }
}
