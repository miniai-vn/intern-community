"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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
 * Rolls back on error while guarding against stale async completions.
 */
export function useOptimisticVote({
  moduleId,
  initialVoted,
  initialCount,
}: UseOptimisticVoteOptions): UseOptimisticVoteReturn {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  const latestRequestId = useRef(0);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    // Optimistic update
    const prevVoted = voted;
    const prevCount = count;
    setVoted(!prevVoted);
    setCount(prevVoted ? prevCount - 1 : prevCount + 1);
    setIsLoading(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });

      if (!res.ok) throw new Error("Vote failed");
    } catch {
      if (isMounted.current && latestRequestId.current === requestId) {
        setVoted(prevVoted);
        setCount(prevCount);
      }
    } finally {
      if (isMounted.current && latestRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [moduleId, voted, count, isLoading]);

  return { voted, count, isLoading, toggle };
}
