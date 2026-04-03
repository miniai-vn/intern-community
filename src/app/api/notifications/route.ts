import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const take = 20;
  const userId = session.user.id;

  const [unreadCount, items] = await Promise.all([
    db.notification.count({ where: { userId, isRead: false } }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ]);

  return NextResponse.json({ unreadCount, items });
}

// Mark all notifications as read
export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  const unreadCount = await db.notification.count({ where: { userId, isRead: false } });
  return NextResponse.json({ unreadCount });
}

