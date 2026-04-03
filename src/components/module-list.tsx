"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialModules: Module[];
  initialNextCursor: string | null;
  q?: string;
  category?: string;
}

export function ModuleList({
  initialModules,
  initialNextCursor,
  q,
  category,
}: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (q) params.set("q", q);
      if (category) params.set("category", category);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) return;

      const data: { items: Module[]; nextCursor: string | null } =
        await res.json();

      setModules((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
    }
  }

  if (modules.length === 0) {
    return null; // empty-state is handled by parent
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={module.hasVoted ?? false}
          />
        ))}
      </div>

      {nextCursor !== null && (
        <div className="flex justify-center pt-2">
          <button
            id="load-more-modules"
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle cx="7" cy="7" r="5.5" strokeOpacity="0.3" />
      <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" />
    </svg>
  );
}
