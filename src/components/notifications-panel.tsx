"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { formatRelativeTime } from "@/lib/utils";

type NotificationItem = {
  id: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  type: "APPROVED" | "REJECTED";
  miniApp: {
    id: string;
    slug: string;
    name: string;
  };
};

type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

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
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    let cancelled = false;

    async function refreshNotifications() {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok || cancelled) return;

      const data = (await response.json()) as NotificationsResponse;
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    }

    const onFocus = () => {
      void refreshNotifications();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function markOneAsRead(notificationId: string) {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
    });

    if (!response.ok) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount((current) => Math.max(current - 1, 0));
    window.dispatchEvent(new Event("notifications-updated"));
    router.refresh();
  }

  async function markAllAsRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
    });

    if (!response.ok) return;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? new Date().toISOString(),
      }))
    );
    setUnreadCount(0);
    window.dispatchEvent(new Event("notifications-updated"));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "All notifications are read"}
        </p>
        <button
          type="button"
          onClick={() => startTransition(() => void markAllAsRead())}
          disabled={isPending || unreadCount === 0}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">You do not have any notifications yet.</p>
          </div>
        )}
        {notifications.map((notification) => {
          const isUnread = notification.readAt === null;

          return (
            <div
              key={notification.id}
              className={`rounded-xl border px-4 py-4 shadow-sm transition-colors ${
                isUnread
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{notification.message}</h3>
                    {isUnread && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatRelativeTime(new Date(notification.createdAt))}
                  </p>
                  <Link
                    href={`/modules/${notification.miniApp.slug}`}
                    className="inline-flex text-sm font-medium text-blue-600 hover:underline"
                  >
                    Open {notification.miniApp.name}
                  </Link>
                </div>

                {isUnread && (
                  <button
                    type="button"
                    onClick={() => void markOneAsRead(notification.id)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}