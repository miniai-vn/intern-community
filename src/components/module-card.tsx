import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
}

export function ModuleCard({ module, hasVoted = false }: ModuleCardProps) {
  return (
    <article className="glass-panel flex h-full flex-col gap-4 rounded-[1.7rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
              {module.category.name}
            </span>
            <span className="text-xs text-stone-400">
              {new Date(module.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <Link
            href={`/modules/${module.slug}`}
            className="block text-lg font-semibold leading-tight text-stone-950 hover:text-emerald-800"
          >
            {module.name}
          </Link>
        </div>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open demo for ${module.name}`}
            className="shrink-0 rounded-full border border-stone-200 bg-white/80 p-2 text-stone-500 hover:border-stone-300 hover:text-stone-900"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-stone-600">{module.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-stone-200/80 pt-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            Author
          </p>
          <Link
            href={`/profile/${module.author.id}`}
            className="block truncate text-sm font-medium text-stone-700 hover:text-emerald-900"
          >
            {module.author.name ?? "Community member"}
          </Link>
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
