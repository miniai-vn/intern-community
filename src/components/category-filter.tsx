"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CategoryFilter({
    categories,
}: {
    categories: { id: string; name: string; slug: string }[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category");

    const handleCategoryClick = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        // Remove cursor when changing category
        params.delete("cursor");

        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => handleCategoryClick(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!currentCategory
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
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${currentCategory === c.slug
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
