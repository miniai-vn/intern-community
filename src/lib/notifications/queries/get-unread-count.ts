// ── Query: GetUnreadCount ────────────────────────────────────────────────────
// Returns only the count of unread notifications for the badge.
// Deliberately separate from GetNotifications to keep the badge fetch cheap.

import { db } from "@/lib/db";

export interface GetUnreadCountQuery {
    userId: string;
}

export async function handleGetUnreadCount(
    query: GetUnreadCountQuery,
): Promise<number> {
    return db.notification.count({
        where: { userId: query.userId, isRead: false },
    });
}
