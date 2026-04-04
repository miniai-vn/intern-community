"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SortDropdown() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Only render on client after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return empty shell during SSR/hydration
    return (
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm font-medium text-gray-700">
          Sort by:
        </label>
        <select
          id="sort"
          disabled
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option>Loading...</option>
        </select>
      </div>
    );
  }

  const currentSort = searchParams.get("sort") ?? "votes";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", e.target.value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        <option value="votes">Most Popular (Most Votes)</option>
        <option value="recent">Most Recent (Newest)</option>
        <option value="name">A-Z (Alphabetical)</option>
      </select>
    </div>
  );
}