"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CategoryItem = {
    id: string;
    name: string;
    slug: string;
};

type CategoryFilterProps = {
    categories: CategoryItem[];
    selectedCategory?: string;
};

export function CategoryFilter({
    categories,
    selectedCategory,
}: CategoryFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateCategory = (nextCategory?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (nextCategory) {
            params.set("category", nextCategory);
        } else {
            params.delete("category");
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => updateCategory(undefined)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
            >
                All
            </button>

            {categories.map((c) => (
                <button
                    key={c.id}
                    type="button"
                    onClick={() => updateCategory(c.slug)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedCategory === c.slug
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