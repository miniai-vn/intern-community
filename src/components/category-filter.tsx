"use client"

import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  activeCategory?: string
  searchQuery?: string
}

export function CategoryFilter({
  categories,
  activeCategory,
  searchQuery,
}: CategoryFilterProps) {
  const router = useRouter()

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams()

    if (searchQuery) params.set("q", searchQuery)

    if (slug && slug !== activeCategory) {
      params.set("category", slug)
    }

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : "/")
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !activeCategory
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.slug)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === cat.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
