"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Submission = {
  id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback: string | null;
  createdAt: string;
  category: { name: string };
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function MySubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    const res = await fetch("/api/my-submissions");
    if (res.status === 401) {
      router.push("/api/auth/signin");
      return;
    }
    if (res.ok) {
      setSubmissions(await res.json());
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <Link
          href="/submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Submission
        </Link>
      </div>

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
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{sub.name}</p>
                <p className="text-xs text-gray-400">
                  {sub.category.name} ·{" "}
                  {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.feedback && (
                  <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    Feedback: {sub.feedback}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[sub.status]}`}
                >
                  {sub.status}
                </span>
                {sub.status === "PENDING" && (
                  <button
                    onClick={() => handleDelete(sub.id, sub.name)}
                    disabled={deletingId === sub.id}
                    aria-label={`Delete ${sub.name}`}
                    className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === sub.id ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
