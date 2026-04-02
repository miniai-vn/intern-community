import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notifications - get user's notifications
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const [notifications, total] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    db.notification.count({
      where: { userId: session.user.id },
    }),
  ]);

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return NextResponse.json({
    items: notifications,
    total,
    unreadCount,
  });
}

// PATCH /api/notifications - mark as read
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId, markAll } = await req.json();

  if (markAll) {
    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
  } else if (notificationId) {
    await db.notification.update({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}