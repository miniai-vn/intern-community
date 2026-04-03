"use client";

import { useEffect, useState } from "react";
import type { Notification } from "@prisma/client";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-500 hover:text-gray-900 p-2"
        aria-label="Notifications"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`border-b px-4 py-3 text-sm last:border-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                  <p className="text-gray-900">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
