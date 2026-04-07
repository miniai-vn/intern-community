"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

type ModulesResponse = {
  items: Module[];
  nextCursor: string | null;
};

interface ModuleListClientProps {
  initialItems: Module[];
  initialNextCursor: string | null;
  q?: string;
  category?: string;
}

export function ModuleListClient({
  initialItems,
  initialNextCursor,
  q,
  category,
}: ModuleListClientProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (q) params.set("q", q);
      if (category) params.set("category", category);

      const res = await fetch(`/api/modules?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load more modules");

      const data: ModulesResponse = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Could not load more modules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={module.hasVoted ?? false}
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
