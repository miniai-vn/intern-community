"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsHeader } from "@/components/notifications-header";
import { NotificationItemCard } from "@/components/notification-item-card";
import type { NotificationItem } from "@/types";

interface NotificationsPanelProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}

export function NotificationsPanel({
  initialNotifications,
  initialUnreadCount,
}: NotificationsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { notifications, unreadCount, markOneAsRead, markAllAsRead } =
    useNotifications({
      initialNotifications,
      initialUnreadCount,
    });

  return (
    <div className="space-y-4">
      <NotificationsHeader
        unreadCount={unreadCount}
        isPending={isPending}
        onMarkAllAsRead={() =>
          startTransition(() =>
            markAllAsRead().then((ok) => {
              if (ok) router.refresh();
            })
          )
        }
      />

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">You do not have any notifications yet.</p>
          </div>
        )}
        {notifications.map((notification) => {
          return (
            <NotificationItemCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={(notificationId) => {
                markOneAsRead(notificationId).then((ok) => {
                  if (ok) router.refresh();
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}