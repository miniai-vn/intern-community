import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/notifications
// Retrieves the user's notifications, along with an unread count
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50, // limit to recent 50 for the dropdown
  });

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications/read-all
// Marks all unread notifications for the user as read
export async function PATCH() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return new NextResponse(null, { status: 204 });
}
