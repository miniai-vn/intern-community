"use client";

import { useState, useMemo } from "react";
import { formatDateLong } from "@/lib/utils";
import type { Module } from "@/types";

interface ReviewedModulesListProps {
  modules: Module[];
}

export function ReviewedModulesList({ modules }: ReviewedModulesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "REJECTED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [displayCount, setDisplayCount] = useState(10);

  // Get unique categories
  const categories = useMemo(() => {
    const unique = new Set(modules.map((m) => m.category.name));
    return Array.from(unique).sort();
  }, [modules]);

  // Filter and search
  const filtered = useMemo(() => {
    return modules.filter((module) => {
      // Search filter
      const matchesSearch =
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" || module.status === statusFilter;

      // Category filter
      const matchesCategory =
        categoryFilter === "ALL" || module.category.name === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [modules, searchQuery, statusFilter, categoryFilter]);

  const displayed = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Search Bar */}
        <div className="flex-1 sm:max-w-xs">
          <label className="block text-xs font-medium text-gray-600">Search</label>
          <input
            type="text"
            placeholder="Module name or contributor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(10); // Reset pagination on search
            }}
            suppressHydrationWarning
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:max-w-xs">
          <label className="block text-xs font-medium text-gray-600">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setDisplayCount(10);
            }}
            suppressHydrationWarning
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:max-w-xs">
          <label className="block text-xs font-medium text-gray-600">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setDisplayCount(10);
            }}
            suppressHydrationWarning
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-xs font-medium text-gray-500">
          {filtered.length === 0
            ? "No results"
            : `${displayed.length} of ${filtered.length}`}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">
          No modules match your filters.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {displayed.map((module) => {
              const reviewedAt = new Date(module.updatedAt);
              const isApproved = module.status === "APPROVED";

              return (
                <div
                  key={module.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                      {module.name}
                    </span>
                    <p className="text-xs text-gray-500">
                      by {module.author.name} · {module.category.name}
                      <span className="text-gray-400">
                        {" "}· Reviewed {formatDateLong(reviewedAt)}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${
                      isApproved
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <span className="text-[10px]">
                      {isApproved ? "✓" : "✕"}
                    </span>
                    <span>{isApproved ? "APPROVED" : "REJECTED"}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <button
              onClick={() => setDisplayCount((c) => c + 10)}
              suppressHydrationWarning
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:cursor-pointer"
            >
              Load More ({filtered.length - displayCount} remaining)
            </button>
          )}
        </>
      )}
    </div>
  );
}
