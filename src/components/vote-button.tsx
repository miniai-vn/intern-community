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
    <div className="relative">
      <button
        onClick={toggle}
        disabled={isLoading}
        aria-label={voted ? "Remove vote" : "Upvote this module"}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
          ${voted
            ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <span className="animate-spin" aria-hidden="true">
            <LoadingIcon />
          </span>
        ) : (
          <TriangleIcon filled={voted} />
        )}
        {count}
      </button>

      {error && (
        <div
          role="alert"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs text-red-600 shadow-lg"
        >
          <div className="flex items-start gap-1.5">
            <AlertIcon className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
}

function LoadingIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
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
