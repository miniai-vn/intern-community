"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModuleCard } from "@/components/module-card";
import { useDebounce } from "@/hooks/use-debounce";
import type { Module } from "@/types";
import type { Category } from "@prisma/client";

interface ModuleBrowserProps {
  initialModules: Module[];
  initialCategories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  initialVotedIds?: Set<string>;
}

export function ModuleBrowser({
  initialModules,
  initialCategories,
  initialQuery = "",
  initialCategory = "",
  initialVotedIds = new Set(),
}: ModuleBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search & filter state
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const debouncedQuery = useDebounce(query, 400);

  // Pagination state
  const [modules, setModules] = useState(initialModules);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [votedIds, setVotedIds] = useState(initialVotedIds);

  // When search or category changes, fetch new results
  useEffect(() => {
    (async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.append("q", debouncedQuery);
        if (selectedCategory) params.append("category", selectedCategory);

        const res = await fetch(`/api/modules?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch modules");

        const data = await res.json();
        setModules(data.items ?? []);
        setNextCursor(data.nextCursor ?? null);

        // Update URL without reload
        const newSearchParams = new URLSearchParams();
        if (debouncedQuery) newSearchParams.set("q", debouncedQuery);
        if (selectedCategory) newSearchParams.set("category", selectedCategory);

        const newUrl = newSearchParams.toString()
          ? `/?${newSearchParams.toString()}`
          : "/";
        router.replace(newUrl);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [debouncedQuery, selectedCategory, router]);

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.append("cursor", nextCursor);
      if (debouncedQuery) params.append("q", debouncedQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more");

      const data = await res.json();
      setModules((prev) => [...prev, ...(data.items ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules…"
            disabled={isSearching}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          {isSearching && (
            <div className="flex items-center px-3 py-2 text-xs text-gray-400">
              Searching…
            </div>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !selectedCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {initialCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.slug)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Modules grid */}
      {modules.length === 0 && !isSearching ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {query && (
            <button
              onClick={() => setQuery("")}
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

          {/* Load more button */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="rounded-lg bg-gray-200 px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-300 disabled:opacity-50"
              >
                {isLoadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
