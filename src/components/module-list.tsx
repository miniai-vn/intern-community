"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialItems: (Module & { hasVoted: boolean })[];
  initialCursor: string | null;
  searchQuery?: string;
  categories?: string[];
}

export function ModuleList({
  initialItems,
  initialCursor,
  searchQuery,
  categories,
}: ModuleListProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (isLoading || !cursor) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (searchQuery) params.set("q", searchQuery);
      if (categories && categories.length > 0) {
        categories.forEach((cat) => params.append("category", cat));
      }

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (error) {
      console.error("Error loading more modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ModuleCard
            key={item.id}
            module={item}
            hasVoted={item.hasVoted}
          />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
