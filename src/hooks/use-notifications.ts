"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationItem, NotificationsResponse } from "@/types";

interface UseNotificationsOptions {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}

export function useNotifications({
  initialNotifications,
  initialUnreadCount,
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      cache: "no-store",
    });

    if (!response.ok) return;

    const data = (await response.json()) as NotificationsResponse;
    setNotifications(data.items);
    setUnreadCount(data.unreadCount);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      refresh();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  // API mark a specific notification as read
  const markOneAsRead = useCallback(async (notificationId: string) => {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
    });

    if (!response.ok) return false;
    // Update local state immediately for better UX
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount((current) => Math.max(current - 1, 0));
    window.dispatchEvent(new Event("notifications-updated"));

    return true;
  }, []);

  // API mark all notifications as read for the authenticated user
  const markAllAsRead = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
    });

    if (!response.ok) return false;
    // Update local state immediately for better UX
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? new Date().toISOString(),
      }))
    );
    setUnreadCount(0);
    window.dispatchEvent(new Event("notifications-updated"));

    return true;
  }, []);

  return {
    notifications,
    unreadCount,
    refresh,
    markOneAsRead,
    markAllAsRead,
  };
}