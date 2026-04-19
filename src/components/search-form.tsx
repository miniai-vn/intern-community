"use client";

import { useEffect, useState } from "react";

interface SearchFormProps {
  initialQuery?: string;
}

export function SearchForm({ initialQuery = "" }: SearchFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <form className="flex gap-2">
        <div className="h-11 w-56 rounded-xl border border-slate-200 bg-white" />
        <div className="h-11 w-24 rounded-xl bg-indigo-500" />
      </form>
    );
  }

  return (
    <form className="flex gap-2">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          name="q"
          defaultValue={initialQuery}
          placeholder="Search modules…"
          className="h-11 w-56 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md"
        />
      </div>
      <button
        type="submit"
        className="btn-shimmer h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-110"
      >
        Search
      </button>
    </form>
  );
}
