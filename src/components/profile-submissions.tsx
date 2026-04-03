"use client";

import { useMemo, useState } from "react";
import type { Category, ModuleStatus } from "@/types";

type SubmissionItem = {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  createdAt: Date | string;
  category: Category;
};

const statusStyles: Record<ModuleStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const filters: Array<{ key: "ALL" | ModuleStatus; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "APPROVED", label: "Approved" },
  { key: "PENDING", label: "Pending" },
  { key: "REJECTED", label: "Rejected" },
];

export function ProfileSubmissions({
  submissions,
}: {
  submissions: SubmissionItem[];
}) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | ModuleStatus>("ALL");

  const normalizedSubmissions = useMemo(
    () =>
      submissions.map((item) => ({
        ...item,
        createdAt:
          item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      })),
    [submissions]
  );

  const filteredSubmissions = useMemo(() => {
    if (activeFilter === "ALL") return normalizedSubmissions;
    return normalizedSubmissions.filter((item) => item.status === activeFilter);
  }, [activeFilter, normalizedSubmissions]);

  return (
    <div className="space-y-4">
      <div className="glass-panel flex flex-wrap gap-2 rounded-[1.4rem] p-3">
        {filters.map((filter) => {
          const count =
            filter.key === "ALL"
              ? normalizedSubmissions.length
              : normalizedSubmissions.filter((item) => item.status === filter.key).length;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                activeFilter === filter.key
                  ? "bg-emerald-950 text-emerald-50"
                  : "bg-white/90 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="section-shell rounded-[1.8rem] border-dashed p-12 text-center">
          <p className="text-lg font-medium text-stone-800">
            No {activeFilter === "ALL" ? "" : activeFilter.toLowerCase()} submissions yet.
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Try another filter to review your submission history.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="glass-panel flex flex-col gap-4 rounded-[1.6rem] p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                      {submission.category.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      {submission.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-stone-950">
                    {submission.name}
                  </p>
                </div>
                <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                  {submission.description}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                  statusStyles[submission.status]
                }`}
              >
                {submission.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
