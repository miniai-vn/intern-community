import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_0_30px_rgba(245,158,11,0.06)]">
      <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/modules/${module.slug}`}
          className="font-display text-lg font-semibold text-text-primary leading-tight transition-colors duration-150 hover:text-amber-400"
        >
          {module.name}
        </Link>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open demo for ${module.name}`}
            className="mt-1 shrink-0 text-text-tertiary transition-colors duration-150 hover:text-amber-400"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {module.description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="rounded-full border border-amber-500/15 bg-amber-warm-bg px-2.5 py-0.5 text-xs font-medium text-amber-400">
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