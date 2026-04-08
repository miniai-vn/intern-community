"use client";

import { useState } from "react";
import type { MiniApp, Category } from "@prisma/client";
import { formatDateLong } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";

interface SubmissionsListProps {
  initialSubmissions: (MiniApp & { category: Category })[];
  addToast: (message: string, options?: { type?: "success" | "error" | "info"; duration?: number }) => void;
}

const statusStyles: Record<string, string> = {
  PENDING: "inline-flex items-center gap-1 border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-700",
  APPROVED: "inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700",
  REJECTED: "inline-flex items-center gap-1 border border-red-200 bg-red-50 px-3 py-0.5 text-xs font-semibold text-red-700",
};

const statusIcons: Record<string, string> = {
  PENDING: "⏳",
  APPROVED: "✓",
  REJECTED: "✕",
};

export function SubmissionsList({ initialSubmissions, addToast }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    setDeletingId(deleteTargetId);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/modules/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete submission");
      }

      // Remove from list
      setSubmissions((prev) => prev.filter((sub) => sub.id !== deleteTargetId));
      setDeleteDialogOpen(false);

      // Show success toast
      addToast(`"${deleteTargetName}" has been deleted`, {
        type: "success",
        duration: 5000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete submission";
      setDeleteError(message);
      
      // Show error toast
      addToast(message, {
        type: "error",
        duration: 5000,
      });
      
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Error message */}
      {deleteError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {submissions.map((sub) => {
        const submittedAt = new Date(sub.createdAt);
        const updatedAt = sub.updatedAt ? new Date(sub.updatedAt) : null;
        const isDeleting = deletingId === sub.id;

        return (
          <div
            key={sub.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start"
          >
            <div className="flex-1 space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{sub.name}</h3>
              <p className="text-xs text-gray-500">
                {sub.category.name} · Submitted {formatDateLong(submittedAt)}
                {updatedAt && sub.status !== "PENDING" && (
                  <span className="text-gray-400">
                    {" "}· Reviewed {formatDateLong(updatedAt)}
                  </span>
                )}
              </p>
              {sub.feedback && (
                <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
                  <p className="font-medium text-blue-900">Admin feedback:</p>
                  <p className="mt-1">{sub.feedback}</p>
                </div>
              )}
            </div>

            {/* Right side: status + actions */}
            <div className="flex flex-col gap-2 sm:items-end">
              <span className={statusStyles[sub.status]}>
                <span className="text-[10px]">{statusIcons[sub.status]}</span>
                <span>{sub.status}</span>
              </span>

              {sub.status === "PENDING" && (
                <div className="flex flex-col gap-2 sm:items-end">
                  <p className="text-[11px] text-gray-500">Under review</p>
                  <button
                    onClick={() => handleDeleteClick(sub.id, sub.name)}
                    disabled={isDeleting}
                    className="text-xs text-red-600 hover:text-red-700 hover:underline hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        title="Delete Submission"
        moduleName={deleteTargetName}
        description="You won't be able to recover this submission after deletion."
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTargetId(null);
          setDeleteTargetName("");
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
