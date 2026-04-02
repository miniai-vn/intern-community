// ── Command: MarkNotificationRead ───────────────────────────────────────────
// Marks a single notification as read.
// Enforces ownership: userId must match to prevent IDOR.

import { db } from "@/lib/db";

export interface MarkNotificationReadCommand {
    notificationId: string;
    userId: string; // ownership check
}

export async function handleMarkNotificationRead(
    cmd: MarkNotificationReadCommand,
): Promise<void> {
    // updateMany is safe here: it's a no-op if the row doesn't belong to userId.
    await db.notification.updateMany({
        where: { id: cmd.notificationId, userId: cmd.userId },
        data: { isRead: true },
    });
}
