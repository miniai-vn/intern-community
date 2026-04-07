"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("category", slug);
    } else {
      // Select All
      params.delete("category");
    }

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 cursor-pointer">
      <button
        onClick={() => handleFilter()}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
          !activeCategory
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleFilter(c.slug)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
            activeCategory === c.slug
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