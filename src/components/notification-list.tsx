"use client";

import type { Notification } from "@prisma/client";

interface NotificationListProps {
  initialNotifications: Notification[];
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  if (initialNotifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <BellOffIcon className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <p className="text-gray-500">You have no notifications yet.</p>
        <p className="mt-1 text-sm text-gray-400">
          You&apos;ll be notified here when your submissions are approved or rejected.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {initialNotifications.map((n) => (
        <li
          key={n.id}
          className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <BellIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800">{n.message}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function BellOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
      <path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
