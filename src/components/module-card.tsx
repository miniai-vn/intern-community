"use client";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";
import { useRouter } from "next/navigation";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
  param: { q: string; category: string };
  handleSearch: (q: string, category: string) => void;
  updateVotedUI: (id: string) => void
}

export function ModuleCard({
  module,
  hasVoted = false,
  param,
  handleSearch,
  updateVotedUI
}: ModuleCardProps) {
  const router = useRouter();
  return (
    <article
      className="flex flex-col h-50 max-lg:h-40 gap-3 rounded-xl border-2 border-deep-ocen bg-white p-5 cursor-pointer duration-300 ease-in-out hover:shadow-default"
      onClick={() => router.push(`/modules/${module.slug}`)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold text-deep-ocen">{module.name}</p>
        {/* TODO [easy-challenge]: icon-only buttons need aria-label — add one to the external link below */}
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-dim-skye hover:text-deep-ocen scale-100 hover:scale-105 duration-300 ease-in active:scale-100"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="flex-1 line-clamp-4 max-lg:line-clamp-2 text-justify">
        {module.description}
      </p>

      <div className="flex items-center justify-between">
        <button
          className="rounded-full bg-dim-skye px-3 py-1 text-white cursor-pointer duration-300 ease-in hover:bg-deep-ocen"
          onClick={(e) => {
            e.stopPropagation();
            handleSearch(param.q, module.category.slug);
          }}
        >
          {module.category.name}
        </button>
        <VoteButton
          moduleId={module.id}
          initialVoted={hasVoted}
          initialCount={module.voteCount}
          updateVotedUI={updateVotedUI}
        />
      </div>
    </article>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="20"
      height="20"
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
