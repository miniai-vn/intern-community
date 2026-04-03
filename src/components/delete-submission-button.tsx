"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this pending submission? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${submissionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorMsg = "Failed to delete submission.";
        try {
          const body = await res.json();
          if (body.error) errorMsg = typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
        } catch {}
        alert(errorMsg);
        return;
      }

      router.refresh();
    } catch {
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete submission"}
    </button>
  );
}
