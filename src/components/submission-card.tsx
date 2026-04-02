"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MiniApp, Category } from "@/types";

interface SubmissionCardProps {
  submission: MiniApp & { category: Category };
  statusStyles: Record<string, string>;
}

export function SubmissionCard({ submission, statusStyles }: SubmissionCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    // Confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to delete "${submission.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/modules/${submission.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to delete submission");
        return;
      }

      // Success - refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const canDelete = submission.status === "PENDING";

  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex-1 space-y-1">
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
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
            statusStyles[submission.status]
          }`}
        >
          {submission.status}
        </span>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Delete ${submission.name}`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
