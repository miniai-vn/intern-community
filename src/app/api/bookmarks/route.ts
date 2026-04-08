import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !rateLimit({
      namespace: "bookmarks",
      key: session.user.id,
      limit: 10,
      windowMs: 60_000,
    })
  ) {
    return NextResponse.json(
      { error: "Too many bookmark actions. Please wait a moment." },
      { status: 429 }
    );
  }

  const { moduleId } = await req.json();
  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json(
      { error: "moduleId is required" },
      { status: 400 }
    );
  }

  const existing = await db.bookmark.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
  });

  if (existing) {
    // !bookmark

    const [_, updated] = await db.$transaction([
      db.bookmark.delete({ where: { id: existing.id }, select: { id: true } }),
      db.miniApp.update({
        where: { id: moduleId },
        data: { bookmarkCount: { decrement: 1 } },
        select: { bookmarkCount: true },
      }),
    ]);

    return NextResponse.json({
      bookmark: false,
      bookmarkCount: updated.bookmarkCount,
    });
  } else {
    // bookmark

    const [_, updated] = await db.$transaction([
      db.bookmark.create({
        data: { userId: session.user.id, moduleId },
        select: { id: true },
      }),
      db.miniApp.update({
        where: { id: moduleId },
        data: { bookmarkCount: { increment: 1 } },
        select: { bookmarkCount: true },
      }),
    ]);

    return NextResponse.json({
      bookmark: true,
      bookmarkCount: updated.bookmarkCount,
    });
  }
}
