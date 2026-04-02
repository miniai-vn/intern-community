"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  currentCategory: string | null;
}

export function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams();
      if (currentQuery) params.set("q", currentQuery);
      if (slug) params.set("category", slug);
      
      router.push(`/?${params.toString()}`);
    },
    [router, currentQuery]
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
          !currentCategory
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleCategoryChange(c.slug)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
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