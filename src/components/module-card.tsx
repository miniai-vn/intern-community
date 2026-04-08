import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import { FavoriteButton } from "@/components/favorite-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
  hasFavorited?: boolean;
}

export function ModuleCard({ module, hasVoted = false, hasFavorited = false }: ModuleCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/modules/${module.slug}`}
          className="text-base font-semibold text-gray-900 hover:text-blue-600 hover:underline dark:text-white dark:hover:text-blue-400"
        >
          {module.name}
        </Link>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View demo (opens in new tab)"
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{module.description}</p>

      <div className="mt-auto flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          {module.category.name}
        </span>

        <div className="flex gap-2">
          <FavoriteButton
            moduleId={module.id}
            initialFavorited={hasFavorited}
          />
          <VoteButton
            moduleId={module.id}
            initialVoted={hasVoted}
            initialCount={module.voteCount}
          />
        </div>
      </div>
    </article>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
      <path d="M8 1h5v5" />
      <path d="M13 1 7 7" />
    </svg>
  );
}
