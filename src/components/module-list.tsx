"use client";

import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface ModuleListProps {
  initialModules: Module[];
  initialVotedIds: Set<string>;
  categories: Array<{ id: string; name: string; slug: string }>;
  currentCategory: string | null;
  currentQuery: string | null;
}

export function ModuleList({ 
  initialModules, 
  initialVotedIds,
  categories,
  currentCategory,
  currentQuery 
}: ModuleListProps) {
  const [modules, setModules] = useState(initialModules);
  const [votedIds, setVotedIds] = useState(initialVotedIds);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Lưu cursor khi có modules mới
  useEffect(() => {
    if (isInitialLoad && initialModules.length > 0) {
      // Lấy cursor từ module cuối cùng
      const lastModule = initialModules[initialModules.length - 1];
      if (lastModule) {
        setCursor(lastModule.id);
      }
      setIsInitialLoad(false);
    }
  }, [initialModules, isInitialLoad]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (currentCategory) params.set("category", currentCategory);
      if (currentQuery) params.set("q", currentQuery);

      const res = await fetch(`/api/modules?${params.toString()}`);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        setModules(prev => [...prev, ...data.items]);
        
        // Cập nhật cursor mới
        if (data.nextCursor) {
          setCursor(data.nextCursor);
        } else {
          setHasMore(false);
        }

        // Cập nhật votedIds cho module mới (nếu có user vote)
        // Note: Bạn có thể cần fetch votes riêng hoặc API trả về luôn
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more modules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, currentCategory, currentQuery]);

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
        {(currentQuery || currentCategory) && (
          <a href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
            Clear filters
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
            hasVoted={votedIds.has(module.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                Loading...
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