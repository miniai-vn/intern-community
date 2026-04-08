"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialModules: Module[];
  initialVotedIds: Set<string>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

interface ApiResponse {
  items: Module[];
  nextCursor: string | null;
}

export function ModuleList({
  initialModules,
  initialVotedIds,
  categories,
}: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [votedIds, setVotedIds] = useState<Set<string>>(initialVotedIds);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category");
  const search = searchParams.get("q");

  // Load initial data and determine if there are more items
  useEffect(() => {
    // Check if we have exactly 12 items (limit) - if so, there might be more
    setHasMore(initialModules.length === 12);
    
    if (initialModules.length > 0) {
      setNextCursor(initialModules[initialModules.length - 1].id);
    }
  }, [initialModules]);

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("q", search);
      params.set("cursor", nextCursor);

      const response = await fetch(`/api/modules?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data: ApiResponse = await response.json();

      setModules(prev => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);

      // Update voted IDs for new modules
      if (data.items.length > 0) {
        setVotedIds(prev => {
          const newVotedIds = new Set(prev);
          // Note: We could fetch vote status for new modules here
          // For now, we'll keep the existing voted IDs
          return newVotedIds;
        });
      }
    } catch (error) {
      console.error("Error loading more modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const query = formData.get("q") as string;
          const newParams = new URLSearchParams(searchParams);
          
          if (query) {
            newParams.set("q", query);
          } else {
            newParams.delete("q");
          }
          
          router.push(`/?${newParams}`);
        }}>
          <input
            name="q"
            defaultValue={search || ""}
            placeholder="Search modules..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("category");
            router.push(`/?${newParams}`);
          }}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              if (category === c.slug) {
                newParams.delete("category");
              } else {
                newParams.set("category", c.slug);
              }
              router.push(`/?${newParams}`);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {search && (
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("q");
                router.push(`/?${newParams}`);
              }}
              className="mt-2 block text-sm text-blue-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
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
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
