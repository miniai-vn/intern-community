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
  const { voted, count, isLoading, errorMessage, toggle } = useOptimisticVote({
    moduleId,
    initialVoted,
    initialCount,
  });

  if (!session) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <TriangleIcon />
        {count}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={isLoading}
        // aria-busy allows assistive tech to announce that the control
        // is currently processing a user action.
        aria-label={voted ? "Remove vote" : "Upvote this module"}
        aria-busy={isLoading}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-all duration-300 ease-out
          ${voted
            ? "bg-[var(--primary-light)] text-[var(--primary)] hover:shadow-md hover:scale-105"
            : "bg-[var(--muted-background)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? <SpinnerIcon /> : <TriangleIcon filled={voted} />}
        {count}
        {/* Screen-reader-only loading text so feedback is not color/icon only. */}
        {isLoading && <span className="sr-only">Updating vote...</span>}
      </button>

      {/*
        Keep this message area mounted to avoid layout jumping when errors appear.
        aria-live makes API failures (e.g. 429) announced accessibly.
      */}
      <p
        aria-live="polite"
        className={`max-w-52 text-right text-xs text-destructive ${
          errorMessage ? "opacity-100" : "opacity-0"
        }`}
      >
        {errorMessage ?? ""}
      </p>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
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
