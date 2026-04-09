import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = Math.max(1, Math.min(Number(limitParam) || 20, 100));

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.user.id },
      include: {
        module: {
          select: { id: true, slug: true, name: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.notification.count({
      where: {
        userId: session.user.id,
        readAt: null,
      },
    }),
  ]);

  return NextResponse.json({ items, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await db.notification.updateMany({
    where: {
      userId: session.user.id,
      readAt: null,
    },
    data: { readAt: now },
  });

  return NextResponse.json({ updatedCount: result.count, readAt: now.toISOString() });
}
