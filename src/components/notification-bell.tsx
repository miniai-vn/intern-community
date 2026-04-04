"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount);
      setNotifications(data.notifications);
    } catch {
      // silently ignore network errors
    }
  }, []);

  // Fetch on mount, on tab focus, and when admin creates a notification
  useEffect(() => {
    fetchNotifications();

    const handleFocus = () => fetchNotifications();
    const handleCreated = () => fetchNotifications();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("notification:created", handleCreated);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("notification:created", handleCreated);
    };
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    setIsOpen((prev) => !prev);

    // Mark all as read when opening the dropdown
    if (!isOpen && unreadCount > 0) {
      setIsLoading(true);
      try {
        await fetch("/api/notifications", { method: "PATCH" });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {
        // silently ignore
      } finally {
        setIsLoading(false);
      }
    }
  }

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative flex items-center justify-center rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">Loading…</div>
          ) : recentNotifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No notifications yet.
            </div>
          ) : (
            <ul>
              {recentNotifications.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-gray-50 px-4 py-3 last:border-0 ${
                    !n.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
