"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Submission = {
  id: string;
  name: string;
  feedback: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  category: {
    name: string;
  };
};

const statusStyles: Record<Submission["status"], string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export function SubmissionList({
  initialSubmissions,
}: {
  initialSubmissions: Submission[];
}) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Failed to delete submission.");
        return;
      }

      setSubmissions((current) => current.filter((submission) => submission.id !== id));
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Failed to delete submission.");
    } finally {
      setDeletingId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No submissions yet.</p>
        <Link href="/submit" className="mt-2 block text-sm text-blue-600 hover:underline">
          Submit your first module →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {submissions.map((sub) => {
        const isDeleting = deletingId === sub.id;

        return (
          <div
            key={sub.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
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

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[sub.status]}`}
              >
                {sub.status}
              </span>

              {sub.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  disabled={isDeleting}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
