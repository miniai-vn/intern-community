"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this pending submission?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete submission.");
      }
    } catch (e) {
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 ${
        isDeleting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
