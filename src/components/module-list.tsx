"use client";

import { useState } from "react";
import Link from "next/link";
import { ModuleCard } from "./module-card";
import type { Module } from "@/types";

interface ModuleListProps {
  initialModules: Module[];
  initialNextCursor: string | null;
  q?: string;
  category?: string;
}

export function ModuleList({
  initialModules,
  initialNextCursor,
  q,
  category,
}: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor
  );
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = nextCursor !== null;

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("cursor", nextCursor);
      if (q) params.set("q", q);
      if (category) params.set("category", category);

      const response = await fetch(`/api/modules?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load more modules");

      const data = await response.json();
      setModules((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error loading more modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No modules found.</p>
        {q && (
          <Link
            href="/"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            Clear search
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            hasVoted={module.hasVoted}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
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
