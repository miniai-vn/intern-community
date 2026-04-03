"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchFilterProps {
  initialQuery?: string;
}

export function SearchFilter({ initialQuery = "" }: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search modules…"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
