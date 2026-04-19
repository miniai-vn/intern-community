"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";

export function PaginatedModules({
  initialItems,
  initialTotalPages,
  q,
  category,
}: {
  initialItems: any[];
  initialTotalPages: number;
  q?: string;
  category?: string;
}) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  const [slideStatus, setSlideStatus] = useState<"idle" | "sliding-out" | "sliding-in" | "warp">("idle");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  const goToPage = async (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || loading) return;
    setLoading(true);

    const dir = page > currentPage ? "left" : "right";
    setSlideDirection(dir);

    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (category) qs.set("category", category);
      qs.set("page", page.toString());
      qs.set("limit", "3");

      const res = await fetch(`/api/modules?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setSlideStatus("sliding-out");

      setTimeout(() => {
        setItems(data.items);
        setCurrentPage(page);
        setTotalPages(data.totalPages);
        setSlideStatus("warp");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSlideStatus("sliding-in");
            setTimeout(() => {
              setSlideStatus("idle");
              setLoading(false);
            }, 350);
          });
        });
      }, 350);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  let transformClass = "translate-x-0 opacity-100 transition-all duration-350 ease-out";
  if (slideStatus === "sliding-out") {
    transformClass = slideDirection === "left"
      ? "-translate-x-[110%] opacity-0 transition-all duration-350 ease-in"
      : "translate-x-[110%] opacity-0 transition-all duration-350 ease-in";
  } else if (slideStatus === "warp") {
    transformClass = slideDirection === "left"
      ? "translate-x-[110%] opacity-0"
      : "-translate-x-[110%] opacity-0";
  } else if (slideStatus === "sliding-in") {
    transformClass = "translate-x-0 opacity-100 transition-all duration-350 ease-out";
  }

  // Generate page numbers
  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl p-1">
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${transformClass}`}>
          {items.map((module: any) => (
            <ModuleCard key={module.id} module={module} hasVoted={module.hasVoted} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center">
          <div className="glass-card inline-flex items-center gap-1 rounded-2xl px-2 py-2">
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-slate-400">
                  ···
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                    currentPage === p
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  } disabled:cursor-not-allowed`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
