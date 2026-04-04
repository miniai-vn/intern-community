"use client";

import { useState } from "react";
import Link from "next/link";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

type SubmissionItem = {
  id: string;
  name: string;
  status: SubmissionStatus;
  feedback: string | null;
  createdAt: string;
  category: { name: string };
};

const statusStyles: Record<SubmissionStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

interface MySubmissionsListProps {
  initialSubmissions: SubmissionItem[];
}

export function MySubmissionsList({ initialSubmissions }: MySubmissionsListProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(submission: SubmissionItem) {
    if (submission.status !== "PENDING") return;

    const confirmed = window.confirm(
      `Delete submission \"${submission.name}\"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(submission.id);

    try {
      const res = await fetch(`/api/modules/${submission.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Failed to delete submission");
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete submission");
    } finally {
      setDeletingId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No submissions yet.</p>
        <Link href="/submit" className="mt-2 block text-sm text-blue-600 hover:underline">
          Submit your first module {"->"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {submissions.map((sub) => {
        const isPending = sub.status === "PENDING";
        const isDeleting = deletingId === sub.id;

        return (
          <div
            key={sub.id}
            className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{sub.name}</p>
              <p className="text-xs text-gray-400">
                {sub.category.name} · {new Date(sub.createdAt).toLocaleDateString()}
              </p>
              {sub.feedback && (
                <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                  Feedback: {sub.feedback}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                  statusStyles[sub.status]
                }`}
              >
                {sub.status}
              </span>

              {isPending && (
                <button
                  type="button"
                  onClick={() => handleDelete(sub)}
                  disabled={isDeleting}
                  className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
