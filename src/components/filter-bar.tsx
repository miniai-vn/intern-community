import { cn } from "@/lib/utils";
import Link from "next/link";
interface FilterCategory {
  id: string;
  name: string;
  slug: string;
}

interface FilterBarProps {
  categories: FilterCategory[];
  activeCategory?: string;
  query?: string;
}

const chipBaseClass =
  "inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

export function FilterBar({
  categories,
  activeCategory,
  query,
}: FilterBarProps) {
  function buildHref(categorySlug?: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categorySlug) params.set("category", categorySlug);
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  }

  return (
    <nav
      aria-label="Module categories"
      className="flex flex-wrap justify-center gap-2"
    >
      <Link
        href={buildHref()}
        scroll={false}
        className={cn(
          chipBaseClass,
          !activeCategory
            ? "border-violet-400/50 bg-violet-500 text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)]"
            : "border-indigo-300/20 bg-slate-900/70 text-slate-300 hover:border-violet-300/35 hover:text-slate-100",
        )}
      >
        All
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          href={buildHref(category.slug)}
          scroll={false}
          className={cn(
            chipBaseClass,
            activeCategory === category.slug
              ? "border-violet-400/50 bg-violet-500 text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)]"
              : "border-indigo-300/20 bg-slate-900/70 text-slate-300 hover:border-violet-300/35 hover:text-slate-100",
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
