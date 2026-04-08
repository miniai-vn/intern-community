import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteParams = Promise<{ id: string }>;

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 * Body: { isRead: boolean }
 */
export async function PATCH(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isRead } = await request.json();

    // Verify ownership: notification must belong to current user
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.recipientId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own notifications" },
        { status: 403 }
      );
    }

    // Update isRead status
    const updated = await db.notification.update({
      where: { id },
      data: { isRead },
      include: {
        module: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/notifications/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
