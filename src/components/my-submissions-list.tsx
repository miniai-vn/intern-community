"use client";

import { startTransition, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SubmissionItem = {
  id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback: string | null;
  createdAt: string;
  category: {
    name: string;
  };
};

interface MySubmissionsListProps {
  initialSubmissions: SubmissionItem[];
}

const statusStyles: Record<SubmissionItem["status"], string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export function MySubmissionsList({
  initialSubmissions,
}: MySubmissionsListProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasSubmissions = submissions.length > 0;

  const submissionCountLabel = useMemo(() => {
    return `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`;
  }, [submissions.length]);

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete "${name}"? You can only remove pending submissions.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Failed to delete submission.");
      }

      setSubmissions((current) =>
        current.filter((submission) => submission.id !== id)
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete submission. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{submissionCountLabel}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {!hasSubmissions ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No submissions yet.</p>
          <Link
            href="/submit"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            Submit your first module {"->"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const isDeleting = deletingId === submission.id;
            const canDelete = submission.status === "PENDING";

            return (
              <div
                key={submission.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{submission.name}</p>
                  <p className="text-xs text-gray-400">
                    {submission.category.name} - {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                  {submission.feedback && (
                    <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                      Feedback: {submission.feedback}
                    </p>
                  )}
                  {canDelete ? (
                    <p className="text-xs text-gray-500">
                      Pending submissions can be deleted before review.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Reviewed submissions are kept for admin history.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                      statusStyles[submission.status]
                    }`}
                  >
                    {submission.status}
                  </span>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(submission.id, submission.name)}
                      disabled={isDeleting}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
