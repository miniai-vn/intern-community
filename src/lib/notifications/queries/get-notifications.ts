// ── Query: GetNotifications ─────────────────────────────────────────────────
// Returns all notifications for a user, newest first.
// Read-only: never mutates state.

import { db } from "@/lib/db";
import type { Notification, NotificationType } from "../domain/notification";

export interface GetNotificationsQuery {
    userId: string;
}

export async function handleGetNotifications(
    query: GetNotificationsQuery,
): Promise<Notification[]> {
    const rows = await db.notification.findMany({
        where: { userId: query.userId },
        orderBy: { createdAt: "desc" },
        // Cap at 50 to avoid unbounded reads — a pagination cursor can be added later.
        take: 50,
    });

    // Prisma returns type as the enum string; cast is safe because the DB
    // column is constrained to NotificationType values.
    return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        moduleId: r.moduleId,
        moduleName: r.message, // denormalised message stored at write time
        type: r.type as NotificationType,
        isRead: r.isRead,
        createdAt: r.createdAt,
    }));
}
