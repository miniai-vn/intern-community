"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";
import type { Category } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterControlsProps {
  categories: Category[];
  currentCategory?: string;
  currentQuery?: string;
  currentSort?: string;
}

export function FilterControls({
  categories,
  currentCategory,
  currentQuery,
  currentSort,
}: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentQuery || "");

  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [pathname, router, searchParams]);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (currentQuery || "")) {
        updateFilters({ q: search || undefined });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, currentQuery, updateFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className={cn("h-5 w-5 transition-colors", isPending ? "text-blue-500 animate-pulse" : "text-gray-400 group-focus-within:text-blue-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm module (ví dụ: Pomodoro, Game...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-2xl border-none bg-white py-3.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Sắp xếp:</span>
          <select
            value={currentSort || "votes"}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="rounded-xl border-none bg-white py-2.5 pl-3 pr-8 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
          >
            <option value="votes">Phổ biến nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => updateFilters({ category: undefined })}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200",
            !currentCategory
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 bg-white shadow-sm"
          )}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateFilters({ category: c.slug })}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200",
              currentCategory === c.slug
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 bg-white shadow-sm"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
