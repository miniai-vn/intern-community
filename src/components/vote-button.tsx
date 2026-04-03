"use client";

import { memo } from "react";
import { useOptimisticVote } from "@/hooks/use-optimistic-vote";
import { useSession } from "next-auth/react";

interface VoteButtonProps {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
}

export const VoteButton = memo(function VoteButton({
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
      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
        <TriangleIcon />
        {count}
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={voted ? "Remove vote" : "Upvote this module"}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
        ${voted
          ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30"
          : "bg-slate-700/50 text-slate-300 hover:text-slate-100 hover:bg-slate-700 border border-slate-600/50"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <TriangleIcon filled={voted} />
      )}
      {count}
    </button>
  );
});

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
