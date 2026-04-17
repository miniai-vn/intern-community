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
      <span className="inline-flex items-center gap-1.5 text-sm text-text-tertiary">
        <TriangleIcon filled={voted} />
        {count}
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={voted ? "Remove vote" : "Upvote this module"}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-200
        ${voted
          ? "border border-amber-500/25 bg-amber-warm-bg text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-amber-500/40 hover:shadow-[0_0_18px_rgba(245,158,11,0.2)]"
          : "border border-border bg-surface-raised text-text-secondary hover:border-border-strong hover:text-text-primary"
        }
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {isLoading ? <SpinnerIcon /> : <TriangleIcon filled={voted} />}
      {count}
    </button>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="animate-spin"
    >
      <path d="M6 1a5 5 0 0 1 5 5" />
    </svg>
  );
}

function TriangleIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M7 1.5 L13 11.5 L1 11.5 Z" />
    </svg>
  );
}