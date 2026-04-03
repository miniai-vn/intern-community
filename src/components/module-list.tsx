"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

type ModuleListProps = {
  initialModules: Module[];
  initialNextCursor: string | null;
  category?: string;
  q?: string;
};

type ModulesResponse = {
  items: Module[];
  nextCursor: string | null;
};

export function ModuleList({
  initialModules,
  initialNextCursor,
  category,
  q,
}: ModuleListProps) {
  const [modules, setModules] = useState(initialModules);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (category) params.set("category", category);
      if (q) params.set("q", q);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more modules.");

      const body = (await res.json()) as ModulesResponse;
      setModules((current) => [...current, ...body.items]);
      setNextCursor(body.nextCursor);
    } catch {
      setError("Failed to load more modules.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={module.hasVoted}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
