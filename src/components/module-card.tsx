import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import { cn } from "@/lib/utils";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
  featured?: boolean;
}

export function ModuleCard({
  module,
  hasVoted = false,
  featured = false,
}: ModuleCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl border border-indigo-300/15 bg-slate-900/70 shadow-[0_14px_36px_rgba(9,12,25,0.42)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/35 hover:shadow-[0_22px_45px_rgba(68,44,128,0.32)]",
        featured ? "gap-6 p-6 sm:p-7" : "gap-4 p-4 sm:p-5",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "rounded-full border border-indigo-300/20 bg-green-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100",
            featured && "border-violet-300/35 bg-violet-500/20 text-violet-100",
          )}
        >
          {module.category.name}
        </span>

        <div className="flex items-center gap-2">
          <VoteButton
            moduleId={module.id}
            initialVoted={hasVoted}
            initialCount={module.voteCount}
          />
          {module.demoUrl && (
            <a
              href={module.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open demo for ${module.name} in a new tab`}
              className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <Link
          href={`/modules/${module.slug}`}
          className={cn(
            "block truncate font-semibold text-slate-100 transition group-hover:text-violet-200 hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
            featured
              ? "text-xl leading-7 sm:text-2xl"
              : "text-[22px] leading-7",
          )}
        >
          {module.name}
        </Link>

        <p className="line-clamp-2 break-all text-xs leading-5 text-slate-300">
          {module.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-indigo-200/10 pt-4">
        <div className="flex items-center gap-2">
          {module.author.image ? (
            <img
              src={module.author.image}
              alt={module.author.name || "Module author"}
              className="h-7 w-7 rounded-full border border-indigo-300/25 object-cover"
            />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-indigo-300/25 bg-slate-800 text-xs font-semibold text-slate-200">
              {(module.author.name || "A").slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-400">
            by {module.author.name || "Anonymous"}
          </span>
        </div>

        <Link
          href={`/modules/${module.slug}`}
          className="text-[11px] font-semibold text-violet-300 transition hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          View details
        </Link>
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
