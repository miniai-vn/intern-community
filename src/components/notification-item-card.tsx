import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { NotificationItem } from "@/types";

interface NotificationItemCardProps {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationItemCard({
  notification,
  onMarkAsRead,
}: NotificationItemCardProps) {
  const isUnread = notification.readAt === null;

  return (
    <div
      className={`rounded-xl border px-4 py-4 shadow-sm transition-colors ${
        isUnread ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
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
            onClick={() => onMarkAsRead(notification.id)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
}