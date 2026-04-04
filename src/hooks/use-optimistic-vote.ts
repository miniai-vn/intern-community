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
 * Rolls back on error.
 */
export function useOptimisticVote({
  moduleId,
  initialVoted,
  initialCount,
}: UseOptimisticVoteOptions): UseOptimisticVoteReturn {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const isMounted = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    // Cancel any ongoing request for this specific hook instance
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Vote failed");
    } catch (err: any) {
      // Don't rollback if it was a deliberate abort (component unmounted or new click)
      if (err.name === "AbortError") return;

      // Roll back if still mounted
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
