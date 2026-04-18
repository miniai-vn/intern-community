import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/notifications
//
// Returns the current user's notifications ordered newest-first.
// Accepts optional query param:
//   ?unread=true  — returns only the unread count (used by the navbar badge)
//                   to keep the payload tiny for frequent polling.
//
// Example responses:
//   GET /api/notifications          → { notifications: [...], unreadCount: 2 }
//   GET /api/notifications?unread=true → { unreadCount: 2 }
// src/app/api/notifications/route.ts (thêm cursor)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
  if (unreadOnly) {
    const unreadCount = await db.notification.count({ where: { userId: session.user.id, read: false } });
    return NextResponse.json({ unreadCount });
  }

  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = 20; // hoặc 30
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: { id: true, type: true, message: true, read: true, createdAt: true, miniAppId: true, miniApp: { select: { slug: true } } }
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const unreadCount = await db.notification.count({ where: { userId: session.user.id, read: false } });
  return NextResponse.json({ notifications: items, nextCursor, unreadCount });
}

// PATCH /api/notifications
//
// Marks ALL of the current user's unread notifications as read.
// Used by the "Mark all as read" button on the notifications page.
//
// Returns the number of rows updated so the client can verify.
export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count } = await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ updated: count });
}
