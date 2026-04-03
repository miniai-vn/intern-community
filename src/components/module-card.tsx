import Link from "next/link";
import { memo } from "react";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export const ModuleCard = memo(function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/modules/${module.slug}`}
          className="text-base font-semibold text-slate-100 hover:text-purple-400 hover:underline transition"
        >
          {module.name}
        </Link>
        {/* TODO [easy-challenge]: icon-only buttons need aria-label — add one to the external link below */}
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-slate-500 hover:text-purple-400 transition"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-slate-400">{module.description}</p>

      <div className="mt-auto flex items-center justify-between">
        <span className="rounded-full bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-2 py-0.5 text-xs font-medium text-purple-300">
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
});

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
      <path d="M8 1h5v5" />
      <path d="M13 1 7 7" />
    </svg>
  );
}
