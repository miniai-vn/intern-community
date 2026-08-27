"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteSubmissionButtonProps = {
    moduleId: string;
};

export function DeleteSubmissionButton({ moduleId }: DeleteSubmissionButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this pending submission?"
        );
        if (!confirmed) return;

        setIsDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/modules/${moduleId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Failed to delete submission");
            }

            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
    );
}