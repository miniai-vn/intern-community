"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectProps {
  value: "top" | "newest" | "oldest";
}

export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "top") {
      params.delete("sort");
    } else {
      params.set("sort", nextValue);
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/?${query}` : "/");
    });
  }

  return (
    <div className="glass-panel flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
      <label
        htmlFor="sort"
        className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"
      >
        Sort by
      </label>
      <select
        id="sort"
        name="sort"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending}
        className="rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-sm text-stone-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
      >
        <option value="top">Top rated</option>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      {isPending && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-700" />
          Refreshing
        </span>
      )}
    </div>
  );
}
