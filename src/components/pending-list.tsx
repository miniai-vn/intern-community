"use client";

import { useState, useCallback, useMemo } from "react";
import type { SubmissionStatus } from "@prisma/client";
import { AdminReviewCard } from "./admin-review-card";

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

interface PendingListProps {
  initialModules: ModuleData[];
  initialNextCursor: string | null;
  totalCount: number;
  onReview: (status: "APPROVED" | "REJECTED", undoFn: () => Promise<void>, moduleId: string) => void;
}

export function PendingList({
  initialModules,
  initialNextCursor,
  totalCount,
  onReview,
}: PendingListProps) {
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Filter and sort
  const filtered = useMemo(() => {
    let result = modules.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });

    // Sort by createdAt
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [modules, searchQuery, sortOrder]);

  const handleLoadMore = useCallback(async () => {
    if (!cursor || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        cursor,
        status: "PENDING",
      });

      const response = await fetch(`/api/modules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch modules");

      const data: { items: ModuleData[]; nextCursor: string | null } =
        await response.json();

      // Deduplicate by ID
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
  }, [cursor, isLoading]);

  const handleReviewWithRemoval = (
    status: "APPROVED" | "REJECTED",
    undoFn: () => Promise<void>,
    moduleId: string
  ) => {
    // Remove from local list when reviewed
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    // Call parent handler
    onReview(status, undoFn, moduleId);
  };

  if (initialModules.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        All submissions are reviewed. 🎉 Enjoy your day!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls: Search + Sort */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <input
            type="text"
            placeholder="Module name or contributor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-600 mb-1">Sort by date</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs font-medium text-gray-500">
        {filtered.length === 0
          ? "No results"
          : `${filtered.length} of ${modules.length}`}
      </div>

      {/* Grid of pending items */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">
          No modules match your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((module) => (
            <AdminReviewCard
              key={module.id}
              module={module}
              onReview={handleReviewWithRemoval}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
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
