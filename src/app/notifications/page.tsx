"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Notification } from "@/lib/notifications/domain/notification";

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/notifications")
            .then((r) => r.json())
            .then((data) => setNotifications(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const markAllRead = async () => {
        await fetch("/api/notifications", { method: "POST" });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        router.refresh();
    };

    const markOneRead = async (id: string) => {
        await fetch(`/api/notifications/${id}`, { method: "PATCH" });
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="mt-0.5 text-sm text-gray-500">
                            {unreadCount} unread
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-xl bg-gray-100"
                        />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-500">No notifications yet.</p>
                    <Link
                        href="/"
                        className="mt-2 block text-sm text-blue-600 hover:underline"
                    >
                        Browse modules →
                    </Link>
                </div>
            ) : (
                <ul className="space-y-2">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors ${n.isRead
                                    ? "border-gray-200 bg-white"
                                    : "border-blue-100 bg-blue-50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Unread dot */}
                                <span
                                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-blue-500"
                                        }`}
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="text-sm text-gray-800">{n.moduleName}</p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {timeAgo(n.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {!n.isRead && (
                                <button
                                    onClick={() => markOneRead(n.id)}
                                    className="shrink-0 text-xs text-blue-600 hover:underline"
                                >
                                    Mark read
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
