"use client";

import { useEffect, useState } from "react";
import {
  NotificationItem,
  type Notification,
} from "@/components/notification-item";
import {
  NotificationTabs,
  type NotificationFilter,
} from "@/components/notification-tabs";

type NotificationsResponse = {
  notifications: Notification[];
  nextCursor: string | null;
};

function emitNotificationsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notifications-updated"));
  }
}

export function NotificationsClient() {
  const PAGE_SIZE = 5;
  const [activeTab, setActiveTab] = useState<NotificationFilter>("all");
  const [pages, setPages] = useState<Notification[][]>([]);
  const [pageNextCursors, setPageNextCursors] = useState<(string | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaging, setIsPaging] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNotifications(
    filter: NotificationFilter,
    cursor?: string,
  ) {
    const params = new URLSearchParams({ filter, take: String(PAGE_SIZE) });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/notifications?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch notifications");
    }

    return (await res.json()) as NotificationsResponse;
  }

  async function reloadFirstPage(filter: NotificationFilter) {
    const data = await fetchNotifications(filter);
    setPages([data.notifications]);
    setPageNextCursors([data.nextCursor]);
    setCurrentPage(1);
  }

  const hasMorePages =
    pageNextCursors.length > 0 &&
    pageNextCursors[pageNextCursors.length - 1] !== null;
  const totalVisiblePages = pages.length + (hasMorePages ? 1 : 0);
  const currentNotifications = pages[currentPage - 1] ?? [];
  const canGoPrev = currentPage > 1;
  const canGoNext =
    currentPage < pages.length ||
    (currentPage === pages.length && hasMorePages);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications(activeTab);
        if (cancelled) return;
        setPages([data.notifications]);
        setPageNextCursors([data.nextCursor]);
        setCurrentPage(1);
      } catch {
        if (cancelled) return;
        setError("Could not load notifications. Please try again.");
        setPages([]);
        setPageNextCursors([]);
        setCurrentPage(1);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  async function goToPage(page: number) {
    if (page < 1 || page === currentPage || isPaging) return;

    if (page <= pages.length) {
      setCurrentPage(page);
      return;
    }

    if (page !== pages.length + 1) return;

    const cursor = pageNextCursors[pages.length - 1];
    if (!cursor) return;

    setIsPaging(true);
    setError(null);
    try {
      const data = await fetchNotifications(activeTab, cursor);
      setPages((prev) => [...prev, data.notifications]);
      setPageNextCursors((prev) => [...prev, data.nextCursor]);
      setCurrentPage(page);
    } catch {
      setError("Could not change page. Please try again.");
    } finally {
      setIsPaging(false);
    }
  }

  async function markAsRead(id: string) {
    const current = pages.flat().find((item) => item.id === id);
    if (!current || current.isRead) return;

    const previousPages = pages;
    setPages((prev) => {
      if (activeTab === "unread") {
        return prev.map((page) => page.filter((item) => item.id !== id));
      }

      return prev.map((page) =>
        page.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    });

    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        setPages(previousPages);
        setError("Could not mark notification as read.");
        return;
      }

      emitNotificationsUpdated();
    } catch {
      setPages(previousPages);
      setError("Could not mark notification as read.");
    }
  }

  async function markAllAsRead() {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    setError(null);

    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Could not mark all notifications as read.");
        return;
      }

      await reloadFirstPage(activeTab);
      emitNotificationsUpdated();
    } catch {
      setError("Could not mark all notifications as read.");
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-600">Notifications</h1>
        <p className="text-sm text-gray-500">
          Keep track of status updates for your submissions.
        </p>
      </div>

      <NotificationTabs value={activeTab} onChange={setActiveTab} />

      <div>
        <button
          type="button"
          onClick={() => void markAllAsRead()}
          disabled={isLoading || isPaging || isMarkingAll}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isMarkingAll ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : currentNotifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No notifications in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {currentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={markAsRead}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void goToPage(currentPage - 1)}
              disabled={!canGoPrev || isPaging}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalVisiblePages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => void goToPage(page)}
                  disabled={isPaging}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => void goToPage(currentPage + 1)}
              disabled={!canGoNext || isPaging}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>

            <span className="ml-2 text-sm text-gray-500">
              Page {currentPage} / {Math.max(totalVisiblePages, 1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
