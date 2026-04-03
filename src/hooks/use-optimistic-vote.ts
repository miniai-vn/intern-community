"use client";

import { useState, useCallback, useRef } from "react";

interface UseOptimisticVoteOptions {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
}

interface UseOptimisticVoteReturn {
  voted: boolean;
  count: number;
  isLoading: boolean;
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

  // BUG: this ref is never reset when the component unmounts and remounts
  // with the same moduleId (e.g. navigating away and back in the same session).
  // The stale `isMounted` from the previous render is reused.

  const isMounted = useRef(true);

  const toggle = useCallback(async () => {
    if (isLoading) return;

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

      if (!res.ok) throw new Error("Vote failed");
    } catch {
      // Roll back — but only if still mounted (see edge case note above)
      if (isMounted.current) {
        setVoted(prevVoted);
        setCount(prevCount);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [moduleId, voted, count, isLoading]);

  return { voted, count, isLoading, toggle };
}
