"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
}

export function CategoryFilter({
  categories,
  activeCategory,
}: CategoryFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(nextCategory?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="glass-panel flex flex-wrap items-center gap-2 rounded-[1.5rem] p-3">
      <button
        type="button"
        onClick={() => navigate()}
        disabled={isPending}
        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
          !activeCategory
            ? "bg-emerald-950 text-emerald-50"
            : "bg-white/90 text-stone-600 hover:bg-stone-100"
        } disabled:cursor-wait disabled:opacity-70`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => navigate(category.slug)}
          disabled={isPending}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
            activeCategory === category.slug
              ? "bg-emerald-950 text-emerald-50"
              : "bg-white/90 text-stone-600 hover:bg-stone-100"
          } disabled:cursor-wait disabled:opacity-70`}
        >
          {category.name}
        </button>
      ))}

      {isPending && (
        <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-50">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          Updating
        </span>
      )}
    </div>
  );
}
