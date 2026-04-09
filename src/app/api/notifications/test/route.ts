import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create a test notification
    const notification = await db.notification.create({
      data: {
        userId: session.user.id,
        title: "Test Notification",
        message: "This is a test notification to verify the notification system works correctly.",
        type: "TEST",
      },
    });

    return NextResponse.json({ 
      success: true, 
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
      }
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
