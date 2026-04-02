"use client";
import { useEffect, useRef, useState } from "react";
import { NotificationItem } from "./notification-item";
import { Bell } from "lucide-react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const wrapperRef = useRef<HTMLSpanElement>(null);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/notifications/count");
      const data = await res.json();
      setCount(data.count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?skip=0");
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      });
      if (res.ok) {
        setCount(0);
      }
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showTooltip) {
      fetchNotifications();

      return () => {
        if (count > 0) {
          markAllAsRead();
        }
      };
    }
  }, [showTooltip]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex items-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      {/* Icon cái chuông */}
      <Bell className="w-6 h-6 text-gray-600" />

      {/* Badge số lượng */}
      {count > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full border-2 border-white">
          {count > 9 ? "9+" : count}
        </span>
      )}

      {showTooltip && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-white overflow-y-auto shadow-xl rounded-lg border border-gray-200 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-gray-100 font-semibold text-gray-700">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No notifications.
              </div>
            ) : (
              notifications.map((note) => (
                <NotificationItem key={note.id} note={note} />
              ))
            )}
          </div>
        </div>
      )}
    </span>
  );
}
