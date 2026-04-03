"use client";

import { useOptimisticVote } from "@/hooks/use-optimistic-vote";
import { useSession } from "next-auth/react";

interface VoteButtonProps {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
  updateVotedUI: (id: string) => void
}

export function VoteButton({
  moduleId,
  initialVoted,
  initialCount,
  updateVotedUI
}: VoteButtonProps) {
  const { data: session } = useSession();
  const { voted, count, isLoading, toggle } = useOptimisticVote({
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
    <button
      onClick={(e) => {
        e.stopPropagation();
        updateVotedUI(moduleId)
        toggle();
      }}
      disabled={isLoading}
      aria-label={voted ? "Remove vote" : "Upvote this module"}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors
        ${
          voted
            ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {/* TODO [easy-challenge]: this button shows no loading state during API call — add one */}
      <TriangleIcon filled={voted} />
      {count}
    </button>
  );
}

function TriangleIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
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
