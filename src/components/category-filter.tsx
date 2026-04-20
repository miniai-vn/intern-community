"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategoryFilterProps = {
  categories: Category[];
};

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");

  const updateCategory = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!slug) {
      params.delete("category");
    } else if (activeCategory === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(nextUrl);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => updateCategory()}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !activeCategory
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {categories.map((category) => {
        const isActive = activeCategory === category.slug;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => updateCategory(category.slug)}
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