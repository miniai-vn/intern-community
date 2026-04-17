"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@prisma/client";

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get active categories from URL
  const activeCategories = searchParams.getAll("category");
  const currentQuery = searchParams.get("q");

  const toggleCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === null) {
      // Clear all categories if "All" is clicked
      params.delete("category");
    } else {
      const existing = params.getAll("category");
      if (existing.includes(slug)) {
        // Remove if already active
        const updated = existing.filter((s) => s !== slug);
        params.delete("category");
        updated.forEach((s) => params.append("category", s));
      } else {
        // Add if not active
        params.append("category", slug);
      }
    }

    // Preserve the search query if it exists
    if (currentQuery) {
      params.set("q", currentQuery);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isAllActive = activeCategories.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => toggleCategory(null)}
        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
          isAllActive
            ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent"
        }`}
      >
        All
      </button>
      {categories.map((c) => {
        const isActive = activeCategories.includes(c.slug);
        return (
          <button
            key={c.id}
            onClick={() => toggleCategory(c.slug)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
