"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ModuleCard } from "@/components/module-card";
import { buildModuleListingSearchParams, mergeModuleListingPages } from "@/lib/module-listing";
import type { Module } from "@/types";

interface ModuleListingProps {
  initialItems: Module[];
  initialNextCursor: string | null;
  q?: string;
  category?: string;
}

interface ModulesApiResponse {
  items: Module[];
  nextCursor: string | null;
}

export function ModuleListing({
  initialItems,
  initialNextCursor,
  q,
  category,
}: ModuleListingProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
    setNextCursor(initialNextCursor);
    setIsLoading(false);
    setError(null);
  }, [initialItems, initialNextCursor, q, category]);

  async function handleLoadMore() {
    if (!nextCursor || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = buildModuleListingSearchParams({ q, category, cursor: nextCursor });
      const response = await fetch(`/api/modules?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to load more modules.");
      }

      const data = (await response.json()) as ModulesApiResponse;
      setItems((currentItems) => mergeModuleListingPages(currentItems, data.items));
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more modules. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
        {q && (
          <Link href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
            Clear search
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((module) => (
          <ModuleCard key={module.id} module={module} hasVoted={module.hasVoted} />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
