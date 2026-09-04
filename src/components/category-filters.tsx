'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from "@prisma/client";
export function CategoryFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');//get current category from URL

  const handleFilter = (slug: string | null) => {
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Update the 'category' query param based on the clicked filter
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category'); 
    }

    
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleFilter(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !activeCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"//if no category is active, highlight "All" filter
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleFilter(c.slug)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === c.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}//highlight the active category filter
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}