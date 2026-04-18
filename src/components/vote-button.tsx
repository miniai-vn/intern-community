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
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium bg-gray-900/50 px-2 py-1 rounded-md border border-gray-800">
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
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-bold transition-all duration-200
        ${voted
          ? "bg-orange-500/10 text-orange-500 ring-1 ring-inset ring-orange-500/20 hover:bg-orange-500/20"
          : "bg-gray-800/50 text-gray-400 ring-1 ring-inset ring-gray-700/50 hover:bg-gray-800 hover:text-gray-200"
        }
        disabled:opacity-70 disabled:cursor-wait active:scale-90`}
    >{/* TODO [easy-challenge]: this button shows no loading state during API call — add one */}
      {/* Hiển thị Spinner khi isLoading, ngược lại hiển thị Icon tam giác */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <TriangleIcon filled={voted} />
      )}

      <span className={isLoading ? "opacity-50" : "opacity-100"}>
        {count}
      </span>
    </button>
  );
}

// Icon tam giác mặc định
function TriangleIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="transition-transform group-hover:-translate-y-0.5"
    >
      <path d="M6 1 L11 10 L1 10 Z" />
    </svg>
  );
}

// Component Spinner cho trạng thái Loading
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-3 w-3 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}