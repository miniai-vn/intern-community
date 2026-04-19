"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  defaultCategory?: string;
}

export function CategoryFilter({ categories, defaultCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (slug: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug === null) {
        params.delete("category");
      } else {
        params.set("category", slug);
      }
      router.push(`/?${params.toString()}`);
    });
  };

  const currentCategory = searchParams.get("category");
  const isAllSelected = !currentCategory;

  return (
    <div
      className={`flex flex-wrap gap-2 ${isPending ? "opacity-60" : ""}`}
      role="group"
      aria-label="Filter modules by category"
    >
      <button
        onClick={() => handleCategoryChange(null)}
        disabled={isPending}
        aria-pressed={isAllSelected}
        aria-label="Show all modules"
        className={`rounded-xl px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
          isAllSelected
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20"
            : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:ring-slate-300"
        } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        All
      </button>

      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleCategoryChange(c.slug)}
          disabled={isPending}
          aria-pressed={currentCategory === c.slug}
          aria-label={`Filter by ${c.name}`}
          className={`rounded-xl px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
            currentCategory === c.slug
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20"
              : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:ring-slate-300"
          } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
