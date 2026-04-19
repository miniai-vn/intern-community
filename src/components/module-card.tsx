import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  return (
    <article className="glass-card card-animate group flex flex-col gap-3 rounded-2xl p-5 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/modules/${module.slug}`}
          className="text-base font-semibold text-slate-800 transition-colors group-hover:text-indigo-600"
        >
          {module.name}
        </Link>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-all hover:bg-indigo-50 hover:text-indigo-500"
            aria-label="Open demo"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
        {module.description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-500/10">
          {module.category.name}
        </span>

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
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
      <path d="M8 1h5v5" />
      <path d="M13 1 7 7" />
    </svg>
  );
}
