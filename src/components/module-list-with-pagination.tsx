"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleListWithPaginationProps {
  initialModules: Module[];
  initialVotedIds: string[];
  initialNextCursor: string | null;
  searchQuery?: string;
  categorySlug?: string;
}

export function ModuleListWithPagination({
  initialModules,
  initialVotedIds,
  initialNextCursor,
  searchQuery,
  categorySlug,
}: ModuleListWithPaginationProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [votedIds] = useState<Set<string>>(
    () => new Set(initialVotedIds)
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (searchQuery) params.set("q", searchQuery);
      if (categorySlug) params.set("category", categorySlug);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch modules");

      const data: { items: Module[]; nextCursor: string | null } =
        await res.json();

      setModules((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      // Silently fail — user can retry by clicking again
    } finally {
      setIsLoading(false);
    }
  }, [nextCursor, isLoading, searchQuery, categorySlug]);

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
        {searchQuery && (
          <Link
            href="/"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            Clear search
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={votedIds.has(module.id)}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Loading…
              </span>
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
      className="h-4 w-4 animate-spin text-gray-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
