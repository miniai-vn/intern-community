"use client";

import Link from "next/link";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
  activeSearch?: string;
}

/**
 * Client component that updates the `category` search param via <Link>,
 * preserving any active search query (`?q=`).
 *
 * Uses <Link> (recommended over useRouter) so Next.js can prefetch routes
 * and avoids the useSearchParams Suspense requirement.
 * Active state is derived from the server-side searchParams prop passed down
 * from page.tsx, so no client-side hook is needed.
 */
export function CategoryFilter({
  categories,
  activeCategory,
  activeSearch,
}: CategoryFilterProps) {
  const pillClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  const buildHref = (slug: string | null) => ({
    pathname: "/",
    query: {
      ...(activeSearch ? { q: activeSearch } : {}),
      ...(slug ? { category: slug } : {}),
    },
  });

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <Link
        href={buildHref(null)}
        className={pillClass(!activeCategory)}
        aria-current={!activeCategory ? "page" : undefined}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={buildHref(c.slug)}
          className={pillClass(activeCategory === c.slug)}
          aria-current={activeCategory === c.slug ? "page" : undefined}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
