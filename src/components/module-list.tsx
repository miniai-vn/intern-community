"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";
import { MiniApp, Category } from "@prisma/client";

type ExtendedModule = MiniApp & {
  category: Category;
  author: { id: string; name: string | null; image: string | null };
};

interface ModuleListProps {
  initialModules: ExtendedModule[];
  initialCursor: string | null;
  votedIds: Set<string>;
  searchParams: { q?: string; category?: string };
}

export function ModuleList({ initialModules, initialCursor, votedIds, searchParams }: ModuleListProps) {
  const [modules, setModules] = useState<ExtendedModule[]>(initialModules);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (isLoading || !cursor) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        cursor,
        limit: "12",
        ...(searchParams.q && { q: searchParams.q }),
        ...(searchParams.category && { category: searchParams.category }),
      });

      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const json = await res.json();
      
      // Check before append new module to list
      if (json.items && Array.isArray(json.items)) {
        setModules((prev) => [...prev, ...json.items]);
      }

      setCursor(json.nextCursor || null);
    } catch (error) {
      console.error("Error loading more modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={votedIds.has(module.id)}
          />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}