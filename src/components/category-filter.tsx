"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const searchQuery = searchParams.get("q");

  const handleCategoryClick = (categorySlug: string | null) => {
    const params = new URLSearchParams();
    
    // Add search query if present
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    
    // Add category if not "All"
    if (categorySlug) {
      params.set("category", categorySlug);
    }

    const queryString = params.toString();
    const href = queryString ? `/?${queryString}` : "/";
    
    // Client-side navigation WITHOUT reload
    router.push(href);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* All button */}
      <button
        onClick={() => handleCategoryClick(null)}
        suppressHydrationWarning
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !currentCategory
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {/* Category buttons */}
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleCategoryClick(c.slug)}
          suppressHydrationWarning
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentCategory === c.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
