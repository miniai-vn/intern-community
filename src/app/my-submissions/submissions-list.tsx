"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MiniApp, Category } from "@prisma/client";

type Submission = MiniApp & { category: Category };

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export function SubmissionsList({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    const confirmed = confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete. Please try again.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No submissions yet.</p>
        <a href="/submit" className="mt-2 block text-sm text-blue-600 hover:underline">
          Submit your first module →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{sub.name}</p>
            <p className="text-xs text-gray-400">
              {sub.category.name} ·{" "}
              {new Date(sub.createdAt).toLocaleDateString()}
            </p>
            {sub.feedback && (
              <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                Feedback: {sub.feedback}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[sub.status]}`}
            >
              {sub.status}
            </span>

            {sub.status === "PENDING" && (
              <button
                onClick={() => handleDelete(sub.id, sub.name)}
                disabled={deletingId === sub.id}
                className="rounded-lg border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === sub.id ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}