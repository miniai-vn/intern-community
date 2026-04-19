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
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400">
        <ThumbsUpIcon />
        {count}
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={voted ? "Remove vote" : "Upvote this module"}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200
        ${voted
          ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 ring-1 ring-inset ring-orange-200 shadow-sm shadow-orange-500/10 hover:shadow-md"
          : "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-100 hover:text-slate-700"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <ThumbsUpIcon filled={voted} />
      {count}
    </button>
  );
}

function ThumbsUpIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="transition-transform duration-200"
      style={{ transform: filled ? "scale(1.15)" : "scale(1)" }}
    >
      <path d="M7 22V11l5-10a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 1.9l-.77 7.69A2 2 0 0 1 18.74 18H7z" />
      <path d="M2 13v6a2 2 0 0 0 2 2h1V11H4a2 2 0 0 0-2 2z" />
    </svg>
  );
}
