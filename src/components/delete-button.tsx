"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ moduleId }: { moduleId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the submission");
      }

      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      aria-label="Delete pending submission"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
