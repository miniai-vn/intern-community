// PATCH /api/notifications/[id] — mark single notification as read

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleMarkNotificationRead } from "@/lib/notifications/commands/mark-read";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await handleMarkNotificationRead({
        notificationId: id,
        userId: session.user.id,
    });

    return new NextResponse(null, { status: 204 });
}
