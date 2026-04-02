"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSubmissionButtonProps {
  submissionId: string;
  submissionName: string;
}

/**
 * Renders a "Delete" button only for PENDING submissions.
 *
 * Design decisions:
 * - Uses window.confirm() as an acceptable confirmation UX for this scope
 *   (production-grade apps would use a custom modal to match brand styles).
 * - Calls DELETE /api/modules/[id] which already enforces author-or-admin
 *   authorization server-side — no extra client-side guard needed.
 * - Uses router.refresh() to revalidate the server component's data without
 *   a full page reload, following the pattern used in submit-form.tsx.
 */
export function DeleteSubmissionButton({
  submissionId,
  submissionName,
}: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${submissionName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${submissionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? "Failed to delete. Please try again.");
        return;
      }

      // Revalidate the server component so the list updates in place.
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete submission "${submissionName}"`}
      className="mt-2 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting ? "Deleting…" : "Delete"}
    </button>
  );
}
