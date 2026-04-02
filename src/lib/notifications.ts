import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { NotificationItem, NotificationsResponse } from "@/types";

type NotificationRecord = Prisma.NotificationGetPayload<{
  include: {
    miniApp: { select: { id: true; slug: true; name: true } };
  };
}>;

function toNotificationItem(notification: NotificationRecord): NotificationItem {
  return {
    id: notification.id,
    message: notification.message,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
    type: notification.type,
    miniApp: {
      id: notification.miniApp.id,
      slug: notification.miniApp.slug,
      name: notification.miniApp.name,
    },
  };
}

export async function getNotificationsForUser(userId: string): Promise<NotificationsResponse> {
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      include: {
        miniApp: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return {
    items: notifications.map(toNotificationItem),
    unreadCount,
  };
}
