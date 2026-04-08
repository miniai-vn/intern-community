"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  moduleId: string;
}

/**
 * Fires a single POST /api/views on mount to record a page view.
 * Uses a ref guard to prevent double-firing in React StrictMode.
 */
export function ViewTracker({ moduleId }: ViewTrackerProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    }).catch(() => {
      // Silently ignore — view tracking is non-critical
    });
  }, [moduleId]);

  return null;
}
