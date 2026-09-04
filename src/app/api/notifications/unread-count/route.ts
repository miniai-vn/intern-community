import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/notifications/unread-count
// Chỉ trả về số đếm — COUNT(*) với index nhanh hơn fetch full list
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    // Trả 0 thay vì 401 — guest không có notifications
    return NextResponse.json({ count: 0 });
  }

  const count = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return NextResponse.json({ count });
}
