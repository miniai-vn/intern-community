"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CategoryFilter({ 
  categories 
}: { 
  categories: { id: string; name: string; slug: string }[] 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const handleCategorySelect = (slug: string | null) => {
    // using URLSearchParams to keep other generic params like 'q'
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    // reset cursor on category change
    params.delete("cursor");
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategorySelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
          onClick={() => handleCategorySelect(c.slug)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
