"use client";

import { useOptimisticVote } from "@/hooks/use-optimistic-vote";
import { useSession } from "next-auth/react";

interface VoteButtonProps {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
}

export function VoteButton({
  moduleId,
  initialVoted,
  initialCount,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const { voted, count, isLoading, error, toggle } = useOptimisticVote({
    moduleId,
    initialVoted,
    initialCount,
  });

  if (!session) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
        <TriangleIcon />
        {count}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={toggle}
        disabled={isLoading}
        aria-label={voted ? "Remove vote" : "Upvote this module"}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
          ${voted
            ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:cursor-pointer"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:cursor-pointer"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? "animate-pulse" : ""}`}
      >
        <TriangleIcon filled={voted} />
        {count}
      </button>
      {error && (
        <span className="text-xs text-red-600 font-medium" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function TriangleIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M6 1 L11 10 L1 10 Z" />
    </svg>
  );
}
