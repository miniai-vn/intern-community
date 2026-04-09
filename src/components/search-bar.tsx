'use client'

import {  useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || "";
  const [search, setSearch] = useState<string>(q);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (search.trim() === "") {
      newSearchParams.delete('q');
    }
    else {
      newSearchParams.set('q', search);
    }

    router.push(`/?${newSearchParams.toString()}`, {scroll: false});
  }

  return (
      <form
        onSubmit={handleFormSubmit}
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={q}
          onChange={(e) => setSearch(e.target.value)}
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
    )
}