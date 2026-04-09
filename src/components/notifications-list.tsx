"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import type { UserNotification } from "@/types";

const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

interface NotificationsListProps {
  initialNotifications: UserNotification[];
}

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  async function markOneAsRead(id: string) {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.readAt || pendingIds.includes(id)) return;

    setPendingIds((current) => [...current, id]);

    try {
      const response = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!response.ok) return;

      const readAt = new Date();
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, readAt } : notification
        )
      );
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
      router.refresh();
    } finally {
      setPendingIds((current) => current.filter((pendingId) => pendingId !== id));
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);

    try {
      const response = await fetch("/api/notifications", { method: "PATCH" });
      if (!response.ok) return;

      const readAt = new Date();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? readAt,
        }))
      );
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
      router.refresh();
    } finally {
      setIsMarkingAll(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {unreadCount} unread of {notifications.length} total
        </p>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || isMarkingAll}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const isPending = pendingIds.includes(notification.id);
          const isUnread = !notification.readAt;

          return (
            <article
              key={notification.id}
              className={`rounded-xl border bg-white p-4 transition-colors ${
                isUnread
                  ? "border-blue-200 bg-blue-50/40"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {formatRelativeTime(new Date(notification.createdAt))}
                  </p>
                  {notification.module?.status === "APPROVED" && (
                    <Link
                      href={`/modules/${notification.module.slug}`}
                      className="inline-block text-sm text-blue-600 hover:underline"
                    >
                      View module
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isUnread && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                      New
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => markOneAsRead(notification.id)}
                    disabled={!isUnread || isPending}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUnread ? "Mark read" : "Read"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
