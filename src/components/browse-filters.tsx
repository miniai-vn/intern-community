"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface BrowseFiltersProps {
  categories: Category[];
  initialCategory?: string;
}

export function BrowseFilters({ categories, initialCategory }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? initialCategory ?? "";
  const currentQuery = searchParams.get("q") ?? "";

  function navigate(nextQuery: string, nextCategory: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.push(nextUrl, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => navigate(currentQuery, "")}
        aria-pressed={currentCategory === ""}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          currentCategory === ""
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isActive = currentCategory === category.slug;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => navigate(currentQuery, category.slug)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
