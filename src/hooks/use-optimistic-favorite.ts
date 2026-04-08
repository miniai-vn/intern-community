"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UseOptimisticFavoriteOptions {
  moduleId: string;
  initialFavorited: boolean;
}

interface UseOptimisticFavoriteReturn {
  isFavorited: boolean;
  isLoading: boolean;
  toggle: () => Promise<void>;
}

/**
 * Manages optimistic favorite state for a module.
 *
 * Optimistically updates the UI immediately, then syncs with the server.
 * Rolls back on error.
 */
export function useOptimisticFavorite({
  moduleId,
  initialFavorited,
}: UseOptimisticFavoriteOptions): UseOptimisticFavoriteReturn {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  // Track if component is mounted using useEffect cleanup
  // This prevents state updates on unmounted components
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    // Optimistic update
    const prevFavorited = isFavorited;
    setIsFavorited(!prevFavorited);
    setIsLoading(true);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });

      if (!res.ok) throw new Error("Favorite toggle failed");
    } catch {
      // Roll back — but only if still mounted
      if (isMounted.current) {
        setIsFavorited(prevFavorited);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [moduleId, isFavorited, isLoading]);

  return { isFavorited, isLoading, toggle };
}
