"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";

export function ModuleList({
  initialModules,
  initialCursor,
  q,
  category,
  view,
  votedIds,
}: any) {
  const [modules, setModules] = useState(initialModules);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!cursor) return;

    setLoading(true);

    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (q) params.set("q", q);
    if (category) params.set("category", category);

    const res = await fetch(`/api/modules?${params.toString()}`);
    const data = await res.json();

    setModules((prev: any) => [...prev, ...data.modules]);
    setCursor(data.nextCursor);

    setLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        {modules.map((module: any, index: number) => {
          const rank = index + 1; // ✅ FIX ranking đúng

          return (
            <div key={module.id} className="flex items-start gap-4">
              {view === "ranking" && (
               <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold mt-2
                        ${rank === 1 ? "bg-yellow-100 text-yellow-600" : ""}
                        ${rank === 2 ? "bg-gray-200 text-gray-600" : ""}
                        ${rank === 3 ? "bg-orange-100 text-orange-600" : ""}
                        ${rank > 3 ? "bg-gray-100 text-gray-700" : ""}
                    `}
                    >
                  {rank === 1 && "🥇"}
                  {rank === 2 && "🥈"}
                  {rank === 3 && "🥉"}
                  {rank > 3 && `#${rank}`}
                </div>
              )}

              <div className="flex-1">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <ModuleCard
                    module={module}
                    hasVoted={votedIds.has(module.id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {cursor && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}