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
      onClick={toggle}
      disabled={isLoading}
      aria-label={
        isLoading
          ? "Updating vote"
          : voted
            ? "Remove vote"
            : "Upvote this module"
      }
      aria-busy={isLoading}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
        ${voted
          ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {/* TODO [easy-challenge]: this button shows no loading state during API call — add one */}
      {isLoading ? <SpinnerIcon /> : <TriangleIcon filled={voted} />}
      {count}
    </button>
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

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="6"
        cy="6"
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />
      <path
        d="M6 1.5a4.5 4.5 0 0 1 4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
