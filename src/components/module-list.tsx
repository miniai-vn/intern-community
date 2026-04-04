"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialModules: Module[];
  initialNextCursor: string | null;
  q?: string;
  category?: string;
  initialVotedIds: string[];
}

interface ModulesResponse {
  items: Module[];
  nextCursor: string | null;
}

export function ModuleList({
  initialModules,
  initialNextCursor,
  q,
  category,
  initialVotedIds,
}: ModuleListProps) {
  const [modules, setModules] = useState(initialModules);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      params.set("cursor", nextCursor);

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) return;

      const data: ModulesResponse = await res.json();

      setModules((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={initialVotedIds.includes(module.id)}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
