interface NotificationsHeaderProps {
  unreadCount: number;
  isPending: boolean;
  onMarkAllAsRead: () => void;
}

export function NotificationsHeader({
  unreadCount,
  isPending,
  onMarkAllAsRead,
}: NotificationsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-gray-500">
        {unreadCount > 0
          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
          : "All notifications are read"}
      </p>
      <button
        type="button"
        onClick={onMarkAllAsRead}
        disabled={isPending || unreadCount === 0}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Mark all as read
      </button>
    </div>
  );
}