"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ModuleStatus } from "@/types";
import { canDeleteModule } from "@/lib/submission-permissions";

const statusStyles: Record<ModuleStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const submissionDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

interface SubmissionItem {
  id: string;
  name: string;
  status: ModuleStatus;
  feedback: string | null;
  createdAt: Date;
  category: {
    name: string;
  };
}

interface MySubmissionsListProps {
  initialSubmissions: SubmissionItem[];
}

export function MySubmissionsList({
  initialSubmissions,
}: MySubmissionsListProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  async function handleDelete(submission: SubmissionItem) {
    const canDelete = canDeleteModule({
      isAdmin: false,
      isOwner: true,
      status: submission.status,
    });

    if (!canDelete) return;

    const confirmed = window.confirm(
      `Delete "${submission.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const previousSubmissions = submissions;
    setDeleteError(null);
    setDeletingId(submission.id);
    setSubmissions((current) =>
      current.filter((item) => item.id !== submission.id)
    );

    try {
      const response = await fetch(`/api/modules/${submission.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setSubmissions(previousSubmissions);
        setDeleteError(await getDeleteErrorMessage(response));
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSubmissions(previousSubmissions);
      setDeleteError("Could not delete the submission. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {deleteError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {deleteError}
        </p>
      )}

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No submissions yet.</p>
          <Link
            href="/submit"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const canDelete = canDeleteModule({
              isAdmin: false,
              isOwner: true,
              status: submission.status,
            });

            return (
              <div
                key={submission.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {submission.name}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          statusStyles[submission.status]
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      {submission.category.name} ·
                      {submissionDateFormatter.format(
                        new Date(submission.createdAt)
                      )}
                    </p>

                    {submission.feedback && (
                      <p className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                        Feedback: {submission.feedback}
                      </p>
                    )}
                  </div>

                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(submission)}
                      disabled={deletingId !== null || isRefreshing}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === submission.id ? "Deleting..." : "Delete"}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Only pending submissions can be deleted.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

async function getDeleteErrorMessage(response: Response) {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  } catch {
    // Ignore JSON parsing errors and fall back to the generic message.
  }

  return "Could not delete the submission. Please try again.";
}