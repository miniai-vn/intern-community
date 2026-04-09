"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/use-debounce";

type Suggestion = {
  id: string;
  name: string;
  slug: string;
};

type HistoryItem = {
  id: string;
  query: string;
};

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const initialQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const debouncedValue = useDebounce(inputValue, 300);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build list of dropdown items: suggestions first, then history
  const dropdownItems: {
    type: "suggestion" | "history";
    label: string;
    slug?: string;
  }[] = [];

  if (debouncedValue.trim()) {
    suggestions.forEach((s) =>
      dropdownItems.push({ type: "suggestion", label: s.name, slug: s.slug }),
    );
  }

  if (history.length > 0) {
    history
      .filter(
        (h) =>
          !debouncedValue.trim() ||
          h.query.toLowerCase().includes(debouncedValue.toLowerCase()),
      )
      .slice(0, 5)
      .forEach((h) => dropdownItems.push({ type: "history", label: h.query }));
  }

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (!debouncedValue.trim()) {
      return;
    }

    let cancelled = false;

    fetch(`/api/modules?q=${encodeURIComponent(debouncedValue.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          const items = (data.items ?? []).slice(0, 5);
          setSuggestions(items);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedValue]);

  // Fetch search history on mount (if logged in)
  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/search-history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {});
  }, [session]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      setIsOpen(false);
      setActiveIndex(-1);

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      router.replace(`/?${params.toString()}`);

      // Save to history if logged in
      if (session?.user && trimmed) {
        fetch("/api/search-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        })
          .then((res) => res.json())
          .then(() => {
            // Refresh history list
            fetch("/api/search-history")
              .then((res) => res.json())
              .then((data) => {
                if (Array.isArray(data)) setHistory(data);
              })
              .catch(() => {});
          })
          .catch(() => {});
      }
    },
    [router, searchParams, session],
  );

  const navigateToModule = useCallback(
    (slug: string) => {
      setIsOpen(false);
      setActiveIndex(-1);
      router.push(`/modules/${slug}`);
    },
    [router],
  );

  const clearHistory = useCallback(() => {
    fetch("/api/search-history", { method: "DELETE" }).catch(() => {});
    setHistory([]);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || dropdownItems.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(inputValue);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < dropdownItems.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : dropdownItems.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < dropdownItems.length) {
          const item = dropdownItems[activeIndex];
          if (item.type === "suggestion" && item.slug) {
            navigateToModule(item.slug);
          } else {
            setInputValue(item.label);
            performSearch(item.label);
          }
        } else {
          performSearch(inputValue);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  const showDropdown = isOpen && (dropdownItems.length > 0 || isLoading);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            setIsLoading(!!e.target.value.trim());
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search modules…"
          className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => performSearch(inputValue)}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
          {isLoading && debouncedValue.trim() && (
            <div className="px-3 py-2 text-xs text-gray-400">Searching…</div>
          )}

          {!isLoading && debouncedValue.trim() && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">
              No modules found
            </div>
          )}

          {dropdownItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            const isSuggestion = item.type === "suggestion";

            return (
              <button
                key={`${item.type}-${item.label}-${idx}`}
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  if (isSuggestion && item.slug) {
                    navigateToModule(item.slug);
                  } else {
                    setInputValue(item.label);
                    performSearch(item.label);
                  }
                }}
              >
                <span className="text-gray-400">
                  {isSuggestion ? "🔍" : "🕒"}
                </span>
                <span className="truncate">{item.label}</span>
                {isSuggestion && (
                  <span className="ml-auto text-xs text-gray-400">module</span>
                )}
              </button>
            );
          })}

          {history.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-1.5">
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear search history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
