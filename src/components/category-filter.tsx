// Created by Cursor
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

type CategoryFilterProps = {
    categories: Category[];
};

type SearchParams = ReturnType<typeof useSearchParams>;

function buildCategoryUrl(
    searchParams: SearchParams,
    nextCategory: string | null
) {
    const params = new URLSearchParams(searchParams.toString());

    if (!nextCategory) params.delete("category");
    else params.set("category", nextCategory);

    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category");
    const isAllActive = !currentCategory;

    return (
        <ul
            className="flex flex-wrap gap-2"
            aria-label="Filter modules by category"
        >
            <li className="list-none">
                <button
                    type="button"
                    aria-current={isAllActive ? "true" : undefined}
                    onClick={() => {
                        const href = buildCategoryUrl(searchParams, null);
                        router.push(href);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                        isAllActive
                            ? "bg-blue-700 text-white ring-1 ring-blue-300/60 dark:bg-blue-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                >
                    All
                </button>
            </li>
            {categories.map((c) => {
                const isActive = currentCategory === c.slug;
                const nextHref = buildCategoryUrl(searchParams, c.slug);

                return (
                    <li key={c.id} className="list-none">
                        <button
                            type="button"
                            aria-current={isActive ? "true" : undefined}
                            onClick={() => router.push(nextHref)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                                isActive
                                    ? "bg-blue-700 text-white ring-1 ring-blue-300/60 dark:bg-blue-600"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            {c.name}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

