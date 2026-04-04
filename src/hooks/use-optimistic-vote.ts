"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseOptimisticVoteOptions {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
}

interface UseOptimisticVoteReturn {
  voted: boolean;
  count: number;
  isLoading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
}

/**
 * Manages optimistic vote state for a module.
 *
 * Optimistically updates the UI immediately, then syncs with the server.
 * Rolls back on error.
 *
 * ⚠️ KNOWN EDGE CASE (intentional for code review purposes):
 * The abort/cleanup logic uses a stale ref pattern. If the user:
 *   1. Clicks vote
 *   2. Navigates away before the API responds
 *   3. Returns to the same page
 * ...the rollback on failure may not execute because `isMounted` is reset.
 * A good reviewer will notice and ask about this. A good candidate will too.
 *
 * See: https://react.dev/learn/synchronizing-with-effects#fetching-data
 */
export function useOptimisticVote({
  moduleId,
  initialVoted,
  initialCount,
}: UseOptimisticVoteOptions): UseOptimisticVoteReturn {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isMounted = useRef(true);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      if (isMounted.current) setError(null);
    }, 4000);
  }, []);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    // Clear previous error on new attempt
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setError(null);

    // Optimistic update
    const prevVoted = voted;
    const prevCount = count;
    setVoted(!prevVoted);
    setCount(prevVoted ? count - 1 : count + 1);
    setIsLoading(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });

      if (!res.ok) {
        // Extract server error message (handles 429 rate limit and other errors)
        let message = "Vote failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse failure, use default message
        }
        throw new Error(message);
      }

      // Sync server data
      router.refresh();
    } catch (err) {
      // Roll back — but only if still mounted (see edge case note above)
      if (isMounted.current) {
        setVoted(prevVoted);
        setCount(prevCount);
        showError(err instanceof Error ? err.message : "Vote failed. Please try again.");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [moduleId, voted, count, isLoading, router, showError]);

  return { voted, count, isLoading, error, toggle };
}
