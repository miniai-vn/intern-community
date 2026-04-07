"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/utils";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15s for background moderation
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenInfo = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark as read
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev: any) => prev.map((n: any) => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenInfo}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-100">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              You have no notifications.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-gray-50 dark:border-gray-800/50 flex flex-col gap-1 ${
                    !n.isRead ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(new Date(n.createdAt))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
