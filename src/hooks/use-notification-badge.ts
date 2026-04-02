"use client";

import { useEffect, useState } from "react";

type BadgeState = {
  userId: string | null;
  count: number;
};

export function useNotificationBadge(userId: string | undefined) {
  const [badgeState, setBadgeState] = useState<BadgeState>({
    userId: null,
    count: 0,
  });

  useEffect(() => {
    if (!userId) return;
    const currentUserId: string = userId;

    let cancelled = false;

    async function loadUnreadCount() {
      const response = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });

      if (!response.ok || cancelled) return;

      const data = (await response.json()) as { count?: number };
      setBadgeState({ userId: currentUserId, count: data.count ?? 0 });
    }

    loadUnreadCount();

    const refreshUnreadCount = () => {
      loadUnreadCount();
    };
    // Refresh unread count when window gains focus or when notifications are updated
    window.addEventListener("focus", refreshUnreadCount);
    window.addEventListener("notifications-updated", refreshUnreadCount);

    return () => {
        // Mark as cancelled to prevent state updates after unmount
      cancelled = true;
      window.removeEventListener("focus", refreshUnreadCount);
      window.removeEventListener("notifications-updated", refreshUnreadCount);
    };
  }, [userId]);

  if (!userId || badgeState.userId !== userId) return 0;
  return badgeState.count;
}