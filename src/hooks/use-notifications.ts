"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AppNotification } from "@/types";

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("notifications_sync");
    
    channelRef.current.onmessage = (event) => {
      if (event.data.type === "SYNC_UNREAD_COUNT") {
        setUnreadCount(event.data.count);
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Hàm helper để vừa set state vừa broadcast cho tab khác
  const syncUnreadCount = useCallback((newCount: number) => {
    setUnreadCount(newCount);
    channelRef.current?.postMessage({ type: "SYNC_UNREAD_COUNT", count: newCount });
  }, []);

  // 2. Fetch chỉ số lượng unread (dùng cho polling)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?unread=true");
      if (!res.ok) return;
      const data = await res.json();
      syncUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently ignore
    }
  }, [syncUnreadCount]);

  // 3. Hàm fetchAll
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      syncUnreadCount(data.unreadCount ?? 0); // Đồng bộ luôn qua channel
    } catch {
      // Silently ignore
    } finally {
      setIsLoading(false);
    }
  }, [syncUnreadCount]);

  // 4. Mark Read (1 item)
  const markRead = useCallback(async (id: string) => {
    // Lưu lại unreadCount hiện tại trước khi optimistic update
    const currentUnread = unreadCount;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    syncUnreadCount(Math.max(0, currentUnread - 1));

    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      await fetchAll(); // rollback
    }
  }, [unreadCount, syncUnreadCount, fetchAll]);

  // 5. Mark All Read
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    syncUnreadCount(0);

    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
    } catch {
      await fetchAll(); // Rollback bằng cách fetch lại data thật
    }
  }, [syncUnreadCount, fetchAll]);

  // 6. Polling Logic (Visibility change)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchUnreadCount();

    function startPolling() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
        startPolling();
      } else {
        stopPolling();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (document.visibilityState === "visible") startPolling();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    notifications,
    isLoading,
    fetchAll,
    markRead,
    markAllRead,
  };
}