'use client';

import { useState } from 'react';

export function SearchForm({ initialQuery, initialCategory }: { initialQuery?: string; initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery || '');

  return (
    <form className="flex gap-2">
      {/* If a category is active, preserve it in the search params */}
      {initialCategory && (
        <input type="hidden" name="category" value={initialCategory} />
      )}
      <input
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search modules…"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        className={`rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90 ${
          query.trim() ? 'bg-black' : 'bg-blue-600'
        }`}
      >
        Search
      </button>
    </form>
  );
}