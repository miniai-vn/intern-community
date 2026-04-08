"use client";

import { useOptimisticFavorite } from "@/hooks/use-optimistic-favorite";
import { useSession } from "next-auth/react";

interface FavoriteButtonProps {
  moduleId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({
  moduleId,
  initialFavorited,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const { isFavorited, isLoading, toggle } = useOptimisticFavorite({
    moduleId,
    initialFavorited,
  });

  if (!session) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
        <StarIcon filled={false} />
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors cursor-pointer
        ${
          isFavorited
            ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-orange-900 dark:text-orange-500 dark:hover:bg-orange-800"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <span className="inline-block animate-spin">
          <StarIcon filled={false} />
        </span>
      ) : (
        <StarIcon filled={isFavorited} />
      )}
    </button>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M8 1.5L10.39 6.26H15.5L11.55 9.74L13.94 14.5L8 11.02L2.06 14.5L4.45 9.74L0.5 6.26H5.61L8 1.5Z" />
    </svg>
  );
}
