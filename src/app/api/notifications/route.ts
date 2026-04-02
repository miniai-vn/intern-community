import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.user.id },
      include: {
        miniApp: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.notification.count({
      where: { userId: session.user.id, readAt: null },
    }),
  ]);

  return NextResponse.json({ items, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}