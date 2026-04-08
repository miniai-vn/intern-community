"use client";

import { useMemo, useState } from "react";
import { NotificationItem } from "@/components/notification-item";
import {
  NotificationTabs,
  type NotificationFilter,
} from "@/components/notification-tabs";
import type { NotificationItem as Notification } from "@/lib/mock-notifications";

type NotificationsClientProps = {
  initialNotifications: Notification[];
};

export function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const [activeTab, setActiveTab] = useState<NotificationFilter>("all");
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "read") return notifications.filter((n) => n.isRead);
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [activeTab, notifications]);

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-600">Notifications</h1>
        <p className="text-sm text-gray-500">
          Keep track of status updates for your submissions.
        </p>
      </div>

      <NotificationTabs value={activeTab} onChange={setActiveTab} />

      {filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No notifications in this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
