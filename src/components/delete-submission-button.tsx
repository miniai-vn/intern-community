"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (error) {
      alert("Failed to delete the submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-sm font-medium ${isDeleting ? "text-gray-400" : "text-red-500 hover:text-red-700 hover:underline"}`}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
