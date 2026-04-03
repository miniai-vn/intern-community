"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";
import { useSearchParams } from "next/navigation";

export function ModuleList({
  initialModules,
  initialNextCursor,
  initialVotedIds,
}: {
  initialModules: any[];
  initialNextCursor: string | null;
  initialVotedIds: string[];
}) {
  const [modules, setModules] = useState(initialModules);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [votedIds] = useState<Set<string>>(new Set(initialVotedIds));
  const searchParams = useSearchParams();

  // Reset state if initial parameters change from server via navigation
  // A more robust app might use React Query, but this handles simple usecases
  const [prevParams, setPrevParams] = useState(searchParams.toString());
  if (searchParams.toString() !== prevParams) {
    setModules(initialModules);
    setNextCursor(initialNextCursor);
    setPrevParams(searchParams.toString());
  }

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("cursor", nextCursor);
      
      const res = await fetch(`/api/modules?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more modules");
      const data = await res.json();
      
      setModules((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      console.error(e);
      alert("Failed to load more modules");
    } finally {
      setIsLoading(false);
    }
  };

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
        <a href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
          Clear search
        </a>
      </div>
    );
  }

  return (
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
      
      {nextCursor && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
