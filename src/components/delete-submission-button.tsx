"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this pending submission?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors ${
        isDeleting ? "cursor-not-allowed" : ""
      }`}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
