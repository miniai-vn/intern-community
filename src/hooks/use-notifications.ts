"use client";

import { useState, useEffect, useCallback } from "react";

// Poll mỗi 30 giây + fetch lại khi user quay lại tab
const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch {
      // Fail silently — badge giữ nguyên giá trị cũ
    }
  }, []);

  useEffect(() => {
    fetchCount(); // Fetch ngay khi mount

    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);

    // Fetch lại khi user quay lại tab
    window.addEventListener("focus", fetchCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchCount);
    };
  }, [fetchCount]);

  return { count, refetch: fetchCount };
}
