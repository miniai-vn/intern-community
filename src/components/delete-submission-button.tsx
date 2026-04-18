"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSubmissionButtonProps {
  submissionId: string;
}

export function DeleteSubmissionButton({ submissionId }: DeleteSubmissionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/modules/${submissionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the submission.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors ${
        isDeleting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
