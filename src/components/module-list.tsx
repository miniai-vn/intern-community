"use client";

import { useState, useEffect } from "react";
import { ModuleCard } from "@/components/module-card";
import { Loader2 } from "lucide-react";
import type { Module } from "@/types";

interface ModuleWithVote extends Module {
  hasVoted?: boolean;
}

interface ModuleListProps {
  initialItems: ModuleWithVote[];
  initialNextCursor: string | null;
  searchQuery?: string;
  categories?: string[];
}

export function ModuleList({
  initialItems,
  initialNextCursor,
  searchQuery,
  categories = [],
}: ModuleListProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);

  // Reset items when search or categories change (server-side data changed)
  useEffect(() => {
    setItems(initialItems);
    setNextCursor(initialNextCursor);
  }, [initialItems, initialNextCursor]);

  async function loadMore() {
    if (isLoading || !nextCursor) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      categories.forEach((c) => params.append("category", c));
      params.set("cursor", nextCursor);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more modules");

      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
        <p className="text-muted-foreground">No modules found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={module.hasVoted}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-2 rounded-full bg-card px-8 py-3 text-sm font-bold text-foreground border border-border transition-all hover:border-primary/50 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <span>Load More Discovery</span>
                <span className="text-primary transition-transform group-hover:translate-y-0.5">↓</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
