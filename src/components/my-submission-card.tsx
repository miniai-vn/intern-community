"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MiniApp, Category } from "@prisma/client";

interface MySubmissionCardProps {
  submission: MiniApp & { category: Category };
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export function MySubmissionCard({ submission }: MySubmissionCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    // Confirmation dialog
    if (!confirm(`Delete "${submission.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/modules/${submission.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to delete submission. Try again.");
        return;
      }

      // Refresh page to update list
      router.refresh();
    } catch (err) {
      setError("An error occurred. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const canDelete = submission.status === "PENDING";

  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{submission.name}</p>
        <p className="text-xs text-gray-400">
          {submission.category.name} ·{" "}
          {new Date(submission.createdAt).toLocaleDateString()}
        </p>
        {submission.feedback && (
          <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
            Feedback: {submission.feedback}
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
            statusStyles[submission.status]
          }`}
        >
          {submission.status}
        </span>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {isDeleting ? "DELETING..." : "DELETE"}
          </button>
        )}
      </div>
    </div>
  );
}