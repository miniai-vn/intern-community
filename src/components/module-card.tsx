import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  return (
    <article className="flex flex-col gap-3 card-elevated p-5">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/modules/${module.slug}`}
          className="text-base font-semibold text-foreground hover:text-[var(--primary)] hover:underline"
        >
          {module.name}
        </Link>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open demo for ${module.name}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{module.description}</p>

      <div className="mt-auto flex items-center justify-between">
        <span className="badge-primary text-xs">
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
