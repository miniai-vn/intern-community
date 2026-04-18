"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/utils";

// Rendered inside the Navbar for authenticated users.
// Shows a bell icon with a red badge when there are unread notifications.
// Clicking opens a small dropdown with the 5 most recent notifications and
// a "View all" link to /notifications.
export function NotificationBell() {
  const { unreadCount, notifications, isLoading, fetchAll, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch full list the first time the dropdown is opened.
  // Subsequent opens re-use the cached list (updated by the polling hook).
  const [hasFetchedAll, setHasFetchedAll] = useState(false);

  async function handleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next && !hasFetchedAll) {
        setHasFetchedAll(true);
        fetchAll();
      }
      return next;
    });
  }

  // Close the dropdown when the user clicks outside.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show only the 5 most recent notifications in the dropdown.
  const recent = notifications.slice(0, 5);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllRead();
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <ul className="divide-y divide-gray-50">
            {isLoading && recent.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                Loading…
              </li>
            ) : recent.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                No notifications yet
              </li>
            ) : (
              recent.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    !n.read ? "bg-blue-50/60" : ""
                  }`}
                >
                  {/* Status dot */}
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.type === "SUBMISSION_APPROVED"
                        ? "bg-green-500"
                        : "bg-red-400"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(new Date(n.createdAt))}
                    </p>
                  </div>
                  {/* Mark single as read */}
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      aria-label="Mark as read"
                      className="mt-1 shrink-0 text-xs text-gray-400 hover:text-blue-600"
                    >
                      ✓
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
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
