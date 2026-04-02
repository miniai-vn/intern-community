import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  const isHot = module.voteCount > 50;

  function formatTime(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      
      {/* HEADER */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/modules/${module.slug}`}
          className="text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600"
        >
          {module.name}
        </Link>

        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open demo in new tab"
            className="shrink-0 text-gray-400 transition hover:text-gray-600"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      {/* DESCRIPTION */}
      <p className="line-clamp-2 text-sm text-gray-600">
        {module.description}
      </p>

      {/* FOOTER */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
        </div>

        <VoteButton
          moduleId={module.id}
          initialVoted={hasVoted}
          initialCount={module.voteCount}
        />
      </div>
    </article>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
      <path d="M8 1h5v5" />
      <path d="M13 1 7 7" />
    </svg>
  );
}