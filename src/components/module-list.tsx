"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialItems: Module[];
  initialCursor: string | null;
  votedIds: string[];
  q?: string;
  categories?: string[];
}

export function ModuleList({
  initialItems,
  initialCursor,
  votedIds,
  q,
  categories,
}: ModuleListProps) {
  const [items, setItems] = useState<Module[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to convert array to Set for fast lookup
  const votedSet = new Set(votedIds);

  async function loadMore() {
    if (isLoading || !nextCursor) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (q) params.set("q", q);
      if (categories && categories.length > 0) {
        categories.forEach((slug) => params.append("category", slug));
      }

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch more items");

      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error loading more modules:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={votedSet.has(module.id)}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center pb-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingIcon />
                Loading...
              </span>
            ) : (
              "Load more modules"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingIcon() {
  return (
    <svg 
      className="animate-spin" 
      width="16" height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
