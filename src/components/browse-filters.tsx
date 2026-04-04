"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/types";

interface BrowseFiltersProps {
  categories: Category[];
}

export function BrowseFilters({ categories }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";

  function setFilters(newQ: string | null, newCategory: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQ !== null) {
      if (newQ) params.set("q", newQ);
      else params.delete("q");
    }

    if (newCategory !== null) {
      if (newCategory) params.set("category", newCategory);
      else params.delete("category");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    setFilters(q, null); // preserve category!
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            name="q"
            defaultValue={currentQ}
            placeholder="Search modules…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilters(null, "")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !currentCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilters(null, c.slug)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentCategory === c.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      
      {isPending && <div className="text-center text-xs text-gray-400 mt-2 mb-2 animate-pulse">Loading modules...</div>}
    </div>
  );
}
