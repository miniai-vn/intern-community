import { cn, formatRelativeTime } from "@/lib/utils";
import type { NotificationItem as Notification } from "@/lib/mock-notifications";

type NotificationItemProps = {
  notification: Notification;
  onClick: (id: string) => void;
};

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const isUnread = !notification.isRead;

  return (
    <button
      type="button"
      onClick={() => onClick(notification.id)}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        isUnread
          ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
          : "border-gray-200 bg-white hover:bg-gray-50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p
            className={cn("text-sm text-gray-900", isUnread && "font-semibold")}
          >
            {notification.title}
          </p>
          <p
            className={cn("text-sm text-gray-600", isUnread && "text-gray-700")}
          >
            {notification.message}
          </p>
        </div>
        <span className="shrink-0 text-xs text-gray-400">
          {formatRelativeTime(new Date(notification.createdAt))}
        </span>
      </div>
    </button>
  );
}
