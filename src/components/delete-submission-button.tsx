"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteSubmissionButtonProps {
  id: string;
  name: string;
  status: string;
}

export function DeleteSubmissionButton({ id, name, status }: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Only show delete button for PENDING submissions
  if (status !== "PENDING") {
    return null;
  }

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Refresh the page to show updated list
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete submission");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      ) : (
        "Delete"
      )}
    </button>
  );
}