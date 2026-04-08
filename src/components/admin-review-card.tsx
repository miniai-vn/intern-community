"use client";

import { useState } from "react";
import { formatDateLong } from "@/lib/utils";
import type { Module } from "@/types";

interface AdminReviewCardProps {
  module: Module;
  onReview?: (status: "APPROVED" | "REJECTED", undoFn: () => Promise<void>, moduleId: string) => void;
}

export function AdminReviewCard({ module, onReview }: AdminReviewCardProps) {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  async function review(status: "APPROVED" | "REJECTED") {
    if (isLoading) return;
    setIsLoading(true);
    setActiveAction(status);
    setError(null);

    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });

      if (!res.ok) {
        throw new Error("Failed to update module status");
      }

      // Show undo toast if callback provided
      if (onReview) {
        const undoFn = async () => {
          const undoRes = await fetch(`/api/modules/${module.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PENDING" }),
          });
          
          if (!undoRes.ok) {
            const errorData = await undoRes.json().catch(() => ({}));
            const errorMessage = errorData?.error?.status?.[0] || "Failed to undo status";
            throw new Error(errorMessage);
          }
        };
        onReview(status, undoFn, module.id);
      }
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  const submittedAt = module.createdAt ? new Date(module.createdAt) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{module.name}</h3>
          <p className="text-xs text-gray-500">
            by {module.author.name} · {module.category.name}
            {submittedAt && (
              <span className="text-gray-400">
                {" "}· Submitted {formatDateLong(submittedAt)}
              </span>
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
          Pending review
        </span>
      </div>

      <p className="line-clamp-3 text-sm text-gray-600">{module.description}</p>

      <div className="flex gap-3 text-xs">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 hover:bg-blue-100"
        >
          View repo
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 font-medium text-gray-700 hover:bg-gray-100"
          >
            Live demo
          </a>
        )}
      </div>

      <div className="mt-1 space-y-2">
        {!showFeedback && (
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            suppressHydrationWarning
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:cursor-pointer transition-colors"
          >
            💬 Add feedback (optional)
          </button>
        )}

        {showFeedback && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700" htmlFor={`feedback-${module.id}`}>
                Feedback to contributor
              </label>
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="text-xs text-gray-400 hover:text-gray-600 hover:cursor-pointer"
              >
                ✕ Hide
              </button>
            </div>
            <textarea
              id={`feedback-${module.id}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share why you approved or rejected this submission"
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>This note will be visible to the contributor.</span>
              <span>{feedback.length}/500</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <div className="flex flex-1 justify-end gap-2">
          <button
            type="button"
            onClick={() => review("APPROVED")}
            disabled={isLoading}
            suppressHydrationWarning
            className="min-w-[96px] rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && activeAction === "APPROVED" ? "Approving..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectConfirm(true)}
            suppressHydrationWarning
            disabled={isLoading}
            className="min-w-[96px] rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && activeAction === "REJECTED" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>

      {error && <p className="pt-1 text-[11px] text-red-600">{error}</p>}

      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">Confirm Rejection</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to reject <strong>{module.name}</strong>? This action cannot be undone.
            </p>
            {feedback && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                <p className="text-[11px] font-medium text-blue-900">Feedback to be sent:</p>
                <p className="mt-1 text-xs text-blue-800 line-clamp-2">{feedback}</p>
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRejectConfirm(false);
                  review("REJECTED");
                }}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 hover:cursor-pointer"
              >
                Proceed Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
