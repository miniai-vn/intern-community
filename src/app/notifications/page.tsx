"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=100");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                !notif.isRead ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}