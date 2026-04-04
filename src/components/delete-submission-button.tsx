"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteSubmissionButtonProps {
  id: string;
  name: string;
}

export function DeleteSubmissionButton({ id, name }: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setError(null);
    const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete. Try again.");
      return;
    }

    // Revalidate server data without a full page reload
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Delete submission ${name}`}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
