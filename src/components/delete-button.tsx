"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "./confirm-dialog";

const DeleteButton = ({
  subId,
  subName,
}: {
  subId: string;
  subName: string;
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${subId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete submission. Please try again.");
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium 
      hover:cursor-pointer hover:bg-red-400 bg-red-500 text-white disabled:opacity-50"
        disabled={isDeleting}
      >
        Delete
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        title="Delete Submission"
        description={`Are you sure you want to delete "${subName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default DeleteButton;
