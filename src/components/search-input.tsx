"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchInput({ initialValue }: { initialValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(initialValue || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      router.push(`/?${params.toString()}`);
    }, 400); // debounce

    return () => clearTimeout(timeout);
  }, [value, searchParams, router]);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search modules..."
        className="w-80 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}