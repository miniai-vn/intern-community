"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import type { AppNotification } from "@/types";

type NotificationResponse = {
  items: AppNotification[];
  unreadCount: number;
};

export function NotificationMenu() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) return;

        const data: NotificationResponse = await res.json();
        if (!ignore) {
          setItems(data.items);
          setUnreadCount(data.unreadCount);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadNotifications();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  async function markAllAsRead() {
    setIsMarkingRead(true);
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) return;

      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } finally {
      setIsMarkingRead(false);
    }
  }

  async function markOneAsRead(id: string) {
    const target = items.find((item) => item.id === id);
    if (!target || target.isRead) return;

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, isRead: false } : item))
      );
      setUnreadCount((current) => current + 1);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-full border border-stone-300 bg-white/80 p-2.5 text-stone-700 hover:border-stone-400 hover:text-stone-950"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-panel absolute right-0 top-14 z-40 w-[22rem] rounded-[1.4rem] p-3 shadow-2xl shadow-stone-900/10">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-2 pb-3">
            <div>
              <p className="text-sm font-semibold text-stone-950">Notifications</p>
              <p className="text-xs text-stone-500">
                Updates about your submissions and review status.
              </p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={isMarkingRead || unreadCount === 0}
              className="text-xs font-medium text-emerald-800 disabled:cursor-not-allowed disabled:text-stone-400"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-2 max-h-96 space-y-2 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="px-2 py-5 text-sm text-stone-500">Loading notifications...</p>
            ) : items.length === 0 ? (
              <p className="px-2 py-5 text-sm text-stone-500">
                No notifications yet.
              </p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.link ?? "/my-submissions"}
                  onClick={() => {
                    setIsOpen(false);
                    void markOneAsRead(item.id);
                  }}
                  className={`block rounded-2xl border px-3 py-3 ${
                    item.isRead
                      ? "border-stone-200 bg-white/70"
                      : "border-emerald-200 bg-emerald-50/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                    {!item.isRead && (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.message}</p>
                  <p className="mt-2 text-xs text-stone-400">
                    {formatRelativeTime(new Date(item.createdAt))}
                  </p>
                </Link>
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
