"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, ModuleStatus } from "@/types";

type SubmissionItem = {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  demoUrl: string | null;
  feedback: string | null;
  status: ModuleStatus;
  category: Category;
  createdAt: Date | string;
};

const statusStyles: Record<ModuleStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export function MySubmissionsList({
  initialSubmissions,
}: {
  initialSubmissions: SubmissionItem[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const normalizedSubmissions = useMemo(
    () =>
      submissions.map((item) => ({
        ...item,
        createdAt:
          item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      })),
    [submissions]
  );

  async function deleteSubmission(id: string, name: string) {
    const confirmed = window.confirm(`Delete "${name}"? This can only be done while it is pending.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        window.alert("Could not delete this submission.");
        return;
      }

      setSubmissions((current) => current.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (normalizedSubmissions.length === 0) {
    return (
      <div className="section-shell rounded-[1.8rem] border-dashed p-14 text-center">
        <p className="text-lg font-medium text-stone-800">No submissions yet.</p>
        <p className="mt-2 text-sm text-stone-500">
          Start with one polished module. You can add more as the project grows.
        </p>
        <Link
          href="/submit"
          className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:text-emerald-950"
        >
          Submit your first module
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {normalizedSubmissions.map((sub) => (
        <div
          key={sub.id}
          className="glass-panel flex flex-col gap-4 rounded-[1.7rem] p-5 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 space-y-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                  {sub.category.name}
                </span>
                <span className="text-xs text-stone-400">
                  {sub.createdAt.toLocaleDateString()}
                </span>
              </div>
              <p className="text-lg font-semibold text-stone-950">{sub.name}</p>
            </div>
            <p className="text-sm leading-6 text-stone-600">{sub.description}</p>
            <div className="flex flex-wrap gap-3 text-xs font-medium text-stone-500">
              <a
                href={sub.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900"
              >
                Repository
              </a>
              {sub.demoUrl && (
                <a
                  href={sub.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-stone-900"
                >
                  Live demo
                </a>
              )}
            </div>
            {sub.feedback && (
              <p className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">
                <span className="font-semibold text-stone-800">Maintainer feedback:</span>{" "}
                {sub.feedback}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                statusStyles[sub.status]
              }`}
            >
              {sub.status}
            </span>
            {sub.status === "PENDING" && (
              <button
                type="button"
                onClick={() => deleteSubmission(sub.id, sub.name)}
                disabled={deletingId === sub.id}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === sub.id ? "Deleting..." : "Delete pending"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
