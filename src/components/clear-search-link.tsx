"use client";

import { usePathname, useRouter } from "next/navigation";

interface ClearSearchLinkProps {
  category?: string;
}

export function ClearSearchLink({ category }: ClearSearchLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleClick() {
    const nextUrl = category ? `${pathname}?category=${category}` : pathname;
    router.push(nextUrl, { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 inline-flex text-sm text-blue-600 hover:underline"
    >
      Clear search
    </button>
  );
}
