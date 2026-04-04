"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUnread = () =>
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.unreadCount ?? 0))
        .catch(() => undefined);

    const interval = setInterval(fetchUnread, 30_000);
    window.addEventListener("focus", fetchUnread);
    fetchUnread();

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchUnread);
    };
  }, []);

  return (
    <Link href="/notifications" className="relative text-gray-600 hover:text-gray-900">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Notifications"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount !== null && unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
