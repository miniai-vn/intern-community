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
  const { voted, count, isLoading, cooldownSec, toggle } = useOptimisticVote({
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

  const isCooldown = cooldownSec > 0;

  return (
    <button
      onClick={toggle}
      disabled={isLoading || isCooldown}
      aria-label={
        isCooldown
          ? `Rate limited. Try again in ${cooldownSec} seconds`
          : voted
            ? "Remove vote"
            : "Upvote this module"
      }
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
        ${
          isCooldown
            ? "bg-red-100 text-red-500"
            : voted
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {/* TODO [easy-challenge]: this button shows no loading state during API call — add one */}
      {isCooldown ? (
        <span className="tabular-nums">{cooldownSec}s</span>
      ) : (
        <>
          <TriangleIcon filled={voted} />
          {count}
        </>
      )}
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
