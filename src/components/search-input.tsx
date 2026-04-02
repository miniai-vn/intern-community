"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface SearchInputProps {
  defaultValue?: string;
}

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term.trim()) {
      params.set('q', term.trim());
    } else {
      params.delete('q');
    }
    
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  }, 300);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Trigger immediate search on submit
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
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
