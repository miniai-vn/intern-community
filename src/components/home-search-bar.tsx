"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface HomeSearchBarProps {
  initialQuery?: string;
}

export function HomeSearchBar({ initialQuery = "" }: HomeSearchBarProps) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname ?? "/";

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentQuery = searchParams?.toString() ?? "";
      const params = new URLSearchParams(currentQuery);
      const trimmed = value.trim();
      const currentQ = params.get("q")?.trim() ?? "";

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      // Only reset pagination when the search term actually changes.
      if (trimmed !== currentQ) {
        params.delete("page");
      }

      const nextQuery = params.toString();
      if (nextQuery === currentQuery) return;

      router.replace(nextQuery ? `${currentPath}?${nextQuery}` : currentPath, {
        scroll: false,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [currentPath, router, searchParams, value]);

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="group relative w-full max-w-xl"
    >
      <div className="absolute -inset-1 rounded-full bg-linear-to-r from-violet-500/35 via-sky-500/20 to-indigo-500/35 opacity-45 blur transition duration-500 group-focus-within:opacity-90" />

      <div className="relative flex items-center gap-2 rounded-full border border-indigo-300/20 bg-slate-950 p-1.5 shadow-[0_12px_30px_rgba(9,12,25,0.65)]">
        <SearchIcon className="ml-3 h-4 w-4 text-slate-500" />
        <input
          id="module-search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search for modules..."
          className="w-full bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          className="absolute right-4 rounded-full"
          onClick={() => setValue("")}
        >
          <CloseIcon className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <label htmlFor="module-search" className="sr-only">
        Search modules
      </label>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.65 16.65" />
    </svg>
  );
}
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  );
}
