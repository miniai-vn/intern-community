"use client";

import { useSession } from "next-auth/react";
import { useOptimisticBookmark } from "@/hooks/use-optimistic-bookmark";

interface BookmarkButtonProps {
  moduleId: string;
  initialBookmarked: boolean;
  initialCount: number;
}

export function BookmarkButton({
  moduleId,
  initialBookmarked,
  initialCount,
}: BookmarkButtonProps) {
  const { data: session } = useSession();

  const { bookmarked, count, isLoading, toggle } = useOptimisticBookmark({
    moduleId,
    initialBookmarked,
    initialCount,
  });

  if (!session) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
        <BookmarkIcon />
        {count}
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this module"}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
        ${
          bookmarked
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        disabled:cursor-not-allowed disabled:opacity-50`}>
      <BookmarkIcon filled={bookmarked} />
      {count}
    </button>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true">
      <path d="M3 1.5h6a.5.5 0 0 1 .5.5v9L6 9 2.5 11V2a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}
