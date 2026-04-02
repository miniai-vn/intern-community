"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedCategories = searchParams.getAll("category");

  const toggleCategory = useCallback((slug: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const current = newParams.getAll("category");
    
    newParams.delete("category");
    
    if (current.includes(slug)) {
      const next = current.filter(c => c !== slug);
      next.forEach(c => newParams.append("category", c));
    } else {
      current.forEach(c => newParams.append("category", c));
      newParams.append("category", slug);
    }
    
    router.push("/?" + newParams.toString(), { scroll: false });
  }, [router, searchParams]);

  const clearCategories = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("category");
    router.push("/?" + newParams.toString(), { scroll: false });
  }, [router, searchParams]);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={clearCategories}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selectedCategories.length === 0
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((c) => {
        const isSelected = selectedCategories.includes(c.slug);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggleCategory(c.slug)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
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
