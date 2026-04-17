"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteSubmissionButtonProps {
  submissionId: string;
  submissionName: string;
}

export function DeleteSubmissionButton({ 
  submissionId, 
  submissionName 
}: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${submissionName}"? This action cannot be undone.`)) {
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
      alert("Something went wrong while deleting. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete submission ${submissionName}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
