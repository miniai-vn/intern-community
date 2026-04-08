"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseOptimisticBookmarkOptions = {
  moduleId: string;
  initialBookmarked: boolean;
  initialCount: number;
};

export function useOptimisticBookmark({
  moduleId,
  initialBookmarked,
  initialCount,
}: UseOptimisticBookmarkOptions) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // use AbortController to cancel in-flight requests on unmount/navigation.
  // This prevents state updates after the component unmounts and avoids rollback glitches.

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // unmount => cancel any in-flight request
      abortRef.current?.abort();
    };
  }, []);

  // Optional: keep state in sync if props change (e.g. navigation)
  useEffect(() => {
    setBookmarked(initialBookmarked);
    setCount(initialCount);
  }, [initialBookmarked, initialCount, moduleId]);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    const prevBookmarked = bookmarked;
    const prevCount = count;

    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Bookmark failed");

      const data = (await res.json()) as {
        bookmark: boolean;
        bookmarkCount: number;
      };

      setBookmarked(data.bookmark);
      setCount(data.bookmarkCount);
    } catch {
      if (controller.signal.aborted) return;
      setBookmarked(prevBookmarked);
      setCount(prevCount);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [moduleId, bookmarked, count, isLoading]);

  return { bookmarked, count, isLoading, toggle };
}
