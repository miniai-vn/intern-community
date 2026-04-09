"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

export function NotificationLink() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function syncUnreadCount() {
      try {
        const response = await fetch("/api/notifications?limit=1", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as { unreadCount?: number };
        if (!cancelled) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // Keep the navbar resilient to temporary network errors.
      }
    }

    const handleRefresh = () => {
      void syncUnreadCount();
    };

    void syncUnreadCount();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleRefresh);
    };
  }, []);

  return (
    <Link href="/notifications" className="relative text-sm text-gray-600 hover:text-gray-900">
      Notifications
      {unreadCount > 0 && (
        <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
