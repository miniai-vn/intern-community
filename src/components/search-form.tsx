"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category");
  const [query, setQuery] = useState(currentQuery);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }
      if (currentCategory) {
        params.set("category", currentCategory);
      }

      const queryString = params.toString();
      const href = queryString ? `/?${queryString}` : "/";
      router.push(href);
    },
    [query, currentCategory, router]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search modules…"
        suppressHydrationWarning
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        suppressHydrationWarning
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
