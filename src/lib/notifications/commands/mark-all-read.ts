// ── Command: MarkAllNotificationsRead ───────────────────────────────────────
// Marks every unread notification for a user as read in a single query.

import { db } from "@/lib/db";

export interface MarkAllNotificationsReadCommand {
    userId: string;
}

export async function handleMarkAllNotificationsRead(
    cmd: MarkAllNotificationsReadCommand,
): Promise<void> {
    await db.notification.updateMany({
        where: { userId: cmd.userId, isRead: false },
        data: { isRead: true },
    });
}
