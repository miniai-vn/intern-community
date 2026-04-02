// GET  /api/notifications      — list all notifications for current user
// POST /api/notifications/read — mark all as read

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleGetNotifications } from "@/lib/notifications/queries/get-notifications";
import { handleMarkAllNotificationsRead } from "@/lib/notifications/commands/mark-all-read";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await handleGetNotifications({ userId: session.user.id });
    return NextResponse.json(notifications);
}

export async function POST() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await handleMarkAllNotificationsRead({ userId: session.user.id });
    return new NextResponse(null, { status: 204 });
}
