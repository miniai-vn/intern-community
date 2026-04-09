'use client'

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"
import React from "react";

type FilterProps = {
  category: string | undefined,
  categories: {id: string, slug: string, name: string}[],
}

export default function CategoryFilter({category, categories}: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterClick = async (e: React.MouseEvent<HTMLAnchorElement>, slug: string | null = null) => {
    e.preventDefault();

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (!slug) {
      newSearchParams.delete('category')
    } else {
      newSearchParams.set('category', slug);
    }
    router.push(`/?${newSearchParams.toString()}`, {scroll: false});
  }

  return (
      <>
        <Link
          href={'/'}
          onClick={(e) => handleFilterClick(e)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {categories && categories.map((c) => (
          <Link
            key={c.id}
            href={`?category=${c.slug}`}
            onClick={(e) => handleFilterClick(e, c.slug)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </>
  );
}