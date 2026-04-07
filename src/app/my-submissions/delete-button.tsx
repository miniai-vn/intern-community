"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (error) {
      alert("Failed to delete");
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
        <span className="text-xs text-gray-500 font-medium">Confirm?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md cursor-pointer bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className="rounded-md cursor-pointer bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-300"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
    >
      Delete
    </button>
  );
}