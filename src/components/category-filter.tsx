"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
}

export function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleCategoryClick(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (slug === null) {
      // "All" clicked - remove category param
      params.delete('category');
    } else {
      // Specific category clicked
      params.set('category', slug);
    }
    
    // Update URL without page reload
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
          onClick={() => handleCategoryClick(c.slug)}
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
