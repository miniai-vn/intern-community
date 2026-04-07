"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "./modal-dialog";

export default function DeleteButton({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setIsOpen(false);

    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission");
      }

      // Refresh the list seamlessly
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
        className="shrink-0 rounded-lg bg-red-500 text-white px-4.5 py-2 text-xs font-medium hover:bg-red-300 disabled:opacity-10 cursor-pointer"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete submission"
        message="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </>
  );
}
