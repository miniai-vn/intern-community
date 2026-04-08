"use client";

import { useState, useCallback, useEffect } from "react";
import type { SubmissionStatus } from "@prisma/client";
import { ModuleCard } from "./module-card";

interface ModuleData {
  id: string;
  name: string;
  description: string;
  slug: string;
  repoUrl: string;
  demoUrl: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  authorId: string;
  category: { id: string; name: string; slug: string };
  author: { id: string; name: string | null; image: string | null };
}

interface ModulesListProps {
  initialModules: ModuleData[];
  initialNextCursor: string | null;
  votedIds: string[]; // Changed from Set<string> to string[]
  category?: string;
  search?: string;
}

export function ModulesList({
  initialModules,
  initialNextCursor,
  votedIds,
  category,
  search,
}: ModulesListProps) {
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert array to Set for O(1) lookup
  const votedIdsSet = new Set(votedIds);

  // Reset modules list when category or search changes (refetch fresh data)
  useEffect(() => {
    setModules(initialModules);
    setCursor(initialNextCursor);
  }, [category, search, initialModules, initialNextCursor]);

  const handleLoadMore = useCallback(async () => {
    if (!cursor || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        cursor,
        ...(category && { category }),
        ...(search && { q: search }),
      });

      const response = await fetch(`/api/modules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch modules");

      const data: { items: ModuleData[]; nextCursor: string | null } =
        await response.json();

      // Deduplicate by ID to prevent "duplicate key" errors
      setModules((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newItems = data.items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      setCursor(data.nextCursor);
    } catch (err) {
      setError("Failed to load more modules");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, category, search]);

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
        {search && (
          <a href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
            Clear search
          </a>
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
            hasVoted={votedIdsSet.has(module.id)}
          />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            suppressHydrationWarning
            className={`rounded-lg px-6 py-2 font-medium transition-colors ${
              isLoading
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
