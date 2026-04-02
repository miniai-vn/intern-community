// GET /api/notifications/count — unread badge count (polled by the bell)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleGetUnreadCount } from "@/lib/notifications/queries/get-unread-count";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        // Return 0 instead of 401 so the bell doesn't flash errors for guests.
        return NextResponse.json({ count: 0 });
    }

    const count = await handleGetUnreadCount({ userId: session.user.id });
    return NextResponse.json({ count });
}
