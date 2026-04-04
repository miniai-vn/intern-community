"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedSlugs: string[];
}

export function CategoryFilter({ categories, selectedSlugs }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleCategory = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Preserve existing ?q= search query
      const currentCategories = params.getAll("category");

      // Remove all existing category params, then rebuild
      params.delete("category");

      if (slug === "") {
        // "All" clicked — clear all category filters
      } else if (currentCategories.includes(slug)) {
        // Deselect: add back all except the clicked one
        currentCategories
          .filter((c) => c !== slug)
          .forEach((c) => params.append("category", c));
      } else {
        // Select: add back all plus the new one
        currentCategories.forEach((c) => params.append("category", c));
        params.append("category", slug);
      }

      const qs = params.toString();
      router.push(pathname + (qs ? `?${qs}` : ""), { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const isAllActive = selectedSlugs.length === 0;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        type="button"
        onClick={() => toggleCategory("")}
        aria-pressed={isAllActive}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          isAllActive
            ? "bg-blue-600 text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {categories.map((c) => {
        const isActive = selectedSlugs.includes(c.slug);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggleCategory(c.slug)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 ring-offset-1"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
