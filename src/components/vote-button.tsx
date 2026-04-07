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
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted">
        <TriangleIcon />
        <span>{count}</span>
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={voted ? "Remove vote" : "Upvote this module"}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-all
        ${voted
          ? "bg-accent-subtle text-accent-subtle-fg ring-1 ring-accent/30 hover:bg-accent/20"
          : "bg-surface-2 text-muted hover:bg-accent-subtle hover:text-accent-subtle-fg"
        }
        disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {/* TODO [easy-challenge]: this button shows no loading state during API call — add one */}
      <TriangleIcon filled={voted} />
      <span>{count}</span>
    </button>
  );
}

function TriangleIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 1 L11 10 L1 10 Z" />
    </svg>
  );
}
