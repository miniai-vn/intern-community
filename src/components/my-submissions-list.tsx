"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/confirm-dialog";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

interface SubmissionItem {
  id: string;
  name: string;
  category: { name: string };
  status: string;
  createdAt: Date;
  feedback?: string | null;
}

interface MySubmissionsListProps {
  submissions: SubmissionItem[];
  isAdmin?: boolean;
}

export function MySubmissionsList({ submissions, isAdmin = false }: MySubmissionsListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/modules/${deleteId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No submissions yet.</p>
        <Link href="/submit" className="mt-2 block text-sm text-blue-600 hover:underline">
          Submit your first module →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{sub.name}</p>
              <p className="text-xs text-gray-400">
                {sub.category.name} · {new Date(sub.createdAt).toLocaleDateString()}
              </p>
              {sub.feedback && (
                <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                  Feedback: {sub.feedback}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                  statusStyles[sub.status]
                }`}
              >
                {sub.status}
              </span>
              <button
                onClick={() => setDeleteId(sub.id)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Delete submission"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete Submission"
          message="Are you sure you want to delete this submission? This action cannot be undone."
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
