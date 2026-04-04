import Link from "next/link";
import { VoteButton } from "@/components/vote-button";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  hasVoted?: boolean;
  fromProfile?: boolean;
  profileId?: string;
}

export function ModuleCard({
  module,
  hasVoted = false,
  fromProfile = false,
  profileId,
}: ModuleCardProps) {
  const queryParams = new URLSearchParams();
  if (fromProfile) {
    queryParams.set("from", "profile");
    if (profileId) {
      queryParams.set("profileId", profileId);
    }
  }

  const moduleUrl = `/modules/${module.slug}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={moduleUrl}
          className="text-base font-semibold text-gray-900 hover:text-blue-600 hover:underline"
        >
          {module.name}
        </Link>
        {/* TODO [easy-challenge]: icon-only buttons need aria-label — add one to the external link below */}
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-gray-600">{module.description}</p>

      <div className="mt-auto flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {module.category.name}
        </span>

        <VoteButton
          moduleId={module.id}
          initialVoted={hasVoted}
          initialCount={module.voteCount}
        />
      </div>

      {/* Author info with link to profile */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Link
          href={`/users/${module.author.id}`}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
        >
          {module.author.image ? (
            <img
              src={module.author.image}
              alt={module.author.name || "Author"}
              className="h-4 w-4 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
              {(module.author.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <span>{module.author.name}</span>
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
