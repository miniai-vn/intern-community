"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  function handleCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    // Update URL without full page reload — client-side navigation
    router.push(`/?${params.toString()}`);
    router.refresh(); // Refresh server data after URL change
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleCategory("")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
          !activeCategory
            ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
            : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-200"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleCategory(c.slug)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            activeCategory === c.slug
              ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
              : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-200"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
