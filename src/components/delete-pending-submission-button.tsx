// Created by Cursor
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePendingSubmissionButtonProps = {
    moduleId: string;
    moduleName: string;
};

export function DeletePendingSubmissionButton({
    moduleId,
    moduleName,
}: DeletePendingSubmissionButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onDelete() {
        const ok = confirm(
            `Delete "${moduleName}"? This cannot be undone.`
        );
        if (!ok) return;

        setIsDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/modules/${moduleId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }
            router.refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                aria-busy={isDeleting}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isDeleting ? "Deleting…" : "Delete"}
            </button>
            {error && (
                <p className="text-xs text-red-600">
                    [API Error]: {error}
                </p>
            )}
        </div>
    );
}

