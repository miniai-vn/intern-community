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
  error: string;
  toggle: () => Promise<void>;
}

export function useOptimisticVote({
  moduleId,
  initialVoted,
  initialCount,
}: UseOptimisticVoteOptions): UseOptimisticVoteReturn {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // <-- lưu message lỗi

  const isMounted = useRef(true);

  const toggle = useCallback(async () => {
    if (isLoading) return;

    setError(""); // reset lỗi trước khi gọi API

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

      const data = await res.json();

      if (!res.ok) {
        // Nếu 429, hiện thông báo rate limit
        if (res.status === 429) {
          setError(data.error || "Too many votes. Please wait a moment.");
        } else {
          setError(data.error || "Vote failed!");
        }
        // rollback optimistic update
        if (isMounted.current) {
          setVoted(prevVoted);
          setCount(prevCount);
        }
      }
    } catch {
      if (isMounted.current) {
        setError("Không thể kết nối server!");
        setVoted(prevVoted);
        setCount(prevCount);
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [moduleId, voted, count, isLoading]);

  return { voted, count, isLoading, error, toggle };
}