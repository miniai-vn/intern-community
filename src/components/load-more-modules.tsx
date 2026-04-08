"use client";

import { useState, useCallback } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface LoadMoreModulesProps {
  initialModules: Module[];
  initialVotedIds: string[];
  initialCursor: string | null;
  searchQuery?: string;
  category?: string;
}

export function LoadMoreModules({
  initialModules,
  initialVotedIds,
  initialCursor,
  searchQuery,
  category,
}: LoadMoreModulesProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [votedIds] = useState<Set<string>>(() => new Set(initialVotedIds));
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !cursor) return;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("cursor", cursor);
      if (searchQuery) params.set("q", searchQuery);
      if (category) params.set("category", category);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch modules");

      const data: { items: Module[]; nextCursor: string | null } =
        await res.json();

      setModules((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setError("Failed to load more modules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, searchQuery, category]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} hasVoted={votedIds.has(m.id)} />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {cursor && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
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
                Loading…
              </span>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </>
  );
}
