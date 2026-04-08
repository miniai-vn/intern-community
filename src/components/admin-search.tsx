"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

export function AdminSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    router.replace(`/admin?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        placeholder="Search modules or authors..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}

        className="w-full rounded-lg border border-gray-700 bg-[#0d1117] pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-500"
      />
      
      {}
      <div className="absolute left-3 top-2.5 text-gray-500 pointer-events-none">
        <Search size={18} strokeWidth={2.5} />
      </div>
    </div>
  );
}