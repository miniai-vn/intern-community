"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialModules: Module[];
  initialNextCursor: string | null;
  votedIds: string[];
  q?: string;
  category?: string;
}

export function ModuleList({
  initialModules,
  initialNextCursor,
  votedIds,
  q,
  category,
}: ModuleListProps) {
  const [modules, setModules] = useState(initialModules);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (q) params.set("q", q);
      if (category) params.set("category", category);

      const res = await fetch(`/api/modules?${params.toString()}`);
      const data = await res.json();

      setModules((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
    }
  }

  const votedSet = new Set(votedIds);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={votedSet.has(module.id)}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
