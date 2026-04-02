import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  return (
    <article className="flex min-h-[210px] flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 hover:text-sky-700">
            <Link
              href={`/modules/${module.slug}`}
              className="block"
            >
              {module.name}
            </Link>
          </h2>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
            {module.description}
          </p>
        </div>

        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open demo for ${module.name}`}
            className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            {module.category.name}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            ⭐ {module.voteCount}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            🧑 {module.author.name ?? "Unknown"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <a
            href={module.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-sky-700 hover:text-sky-900"
          >
            View on GitHub
          </a>
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
