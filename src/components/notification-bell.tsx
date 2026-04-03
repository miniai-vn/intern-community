"use client";

import { useEffect, useRef, useState } from "react";

type NoticeType = "success" | "error" | "info";

interface NotificationItem {
    id: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [toast, setToast] = useState<{ message: string; type: NoticeType } | null>(null);

    function pushClientNotification(params: { message: string }) {
        setNotifications((prev) => [
            {
                id: crypto.randomUUID(),
                message: params.message,
                createdAt: new Date().toISOString(),
                isRead: false,
            },
            ...prev,
        ].slice(0, 20));
        setUnreadCount((c) => c + 1);
    }

    async function loadNotifications() {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
        setNotifications(data.items ?? []);
    }

    async function markAllRead() {
        const res = await fetch("/api/notifications", { method: "PATCH" });
        if (!res.ok) return;
        // Mark current client-only items as read too, then refresh from DB.
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        await loadNotifications();
    }

    useEffect(() => {
        function onNotify(e: Event) {
            const d = (e as CustomEvent).detail as { message: string; type?: NoticeType };
            setToast({ message: d.message, type: d.type ?? "info" });
            pushClientNotification({ message: d.message });
            const t = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(t);
        }
        function onNotifyBell(e: Event) {
            const d = (e as CustomEvent).detail as { message: string; type?: NoticeType };
            setToast({ message: d.message, type: d.type ?? "info" });
            pushClientNotification({ message: d.message });
            const t = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(t);
        }
        function onDocClick(ev: MouseEvent) {
            if (!panelRef.current) return;
            if (!panelRef.current.contains(ev.target as Node)) setOpen(false);
        }
        window.addEventListener("app:notify", onNotify as EventListener);
        window.addEventListener("app:notify:bell", onNotifyBell as EventListener);
        document.addEventListener("click", onDocClick);
        return () => {
            window.removeEventListener("app:notify", onNotify as EventListener);
            window.removeEventListener("app:notify:bell", onNotifyBell as EventListener);
            document.removeEventListener("click", onDocClick);
        };
    }, []);

    useEffect(() => {
        if (!open) return;
        void (async () => {
            await markAllRead();
        })();
    }, [open]);

    useEffect(() => {
        void loadNotifications();
    }, []);

    return (
        <div className="relative" ref={panelRef}>
            <button
                aria-label="Notifications"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {toast && (
                <div
                    className={`absolute right-0 z-50 mt-2 max-w-[320px] rounded-lg px-4 py-2 text-sm shadow-lg whitespace-nowrap overflow-hidden text-ellipsis text-left ${toast.type === "success"
                        ? "bg-green-600 text-white"
                        : toast.type === "error"
                            ? "bg-red-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                >
                    {toast.message}
                </div>
            )}

            {open && (
                <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                        <span className="text-sm font-medium text-gray-800">Notifications</span>
                        <button
                            onClick={() => void markAllRead()}
                            disabled={unreadCount === 0}
                            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            Mark all read
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-400">No notifications</div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={async () => {
                                        const res = await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
                                        if (res.ok) {
                                            setNotifications((prev) =>
                                                prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
                                            );
                                            setUnreadCount((c) => Math.max(0, c - (n.isRead ? 0 : 1)));
                                        }
                                    }}
                                    className="w-full border-b border-gray-50 px-4 py-3 text-left last:border-0 hover:bg-gray-50 disabled:cursor-pointer"
                                >
                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${n.isRead ? "bg-gray-300" : "bg-blue-500"}`} />
                                    <span className={`text-sm ${n.isRead ? "text-gray-600" : "font-semibold text-gray-800"}`}>
                                        {n.message}
                                    </span>
                                    <div className="mt-0.5 text-[11px] text-gray-400">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function BellIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" />
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        </svg>
    );
}

export function notifyBell(params: { message: string; type?: NoticeType }) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("app:notify:bell", { detail: params }));
}
