"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Module } from "@/types";

interface AdminReviewCardProps {
  module: Module;
}

export function AdminReviewCard({ module }: AdminReviewCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeAction, setActiveAction] = useState<"APPROVED" | "REJECTED" | null>(
    null
  );

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    setActiveAction(status);

    try {
      const response = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });

      if (!response.ok) {
        window.alert("Could not update this submission.");
        return;
      }

      setIsExpanded(false);
      router.refresh();
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  return (
    <div
      className={`glass-panel rounded-[1.4rem] px-4 py-4 transition-opacity ${
        isLoading ? "opacity-85" : ""
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
              Pending review
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
              {module.category.name}
            </span>
            <span className="text-xs text-stone-400">
              Submitted {new Date(module.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-stone-950">
              {module.status === "APPROVED" ? (
                <Link href={`/modules/${module.slug}`} className="hover:text-emerald-900">
                  {module.name}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="truncate text-left hover:text-emerald-900"
                >
                  {module.name}
                </button>
              )}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              by {module.author.name ?? "Unknown contributor"}
            </p>
          </div>

          <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">
            {module.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-700" />
              Saving
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 hover:bg-stone-100"
          >
            Review
          </button>
          <button
            onClick={() => review("APPROVED")}
            disabled={isLoading}
            className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeAction === "APPROVED" ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => review("REJECTED")}
            disabled={isLoading}
            className="rounded-full bg-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-50 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeAction === "REJECTED" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>

      {isMounted &&
        isExpanded &&
        createPortal(
          <PendingSubmissionModal
            module={module}
            feedback={feedback}
            setFeedback={setFeedback}
            isLoading={isLoading}
            activeAction={activeAction}
            onApprove={() => review("APPROVED")}
            onReject={() => review("REJECTED")}
            onClose={() => setIsExpanded(false)}
          />,
          document.body
        )}
    </div>
  );
}

function PendingSubmissionModal({
  module,
  feedback,
  setFeedback,
  isLoading,
  activeAction,
  onApprove,
  onReject,
  onClose,
}: {
  module: Module;
  feedback: string;
  setFeedback: (value: string) => void;
  isLoading: boolean;
  activeAction: "APPROVED" | "REJECTED" | null;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/45 px-4 py-8">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-stone-200 bg-[var(--surface)] shadow-2xl shadow-stone-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                {module.category.name}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                Pending review
              </span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
              {module.name}
            </h3>
            <p className="text-sm text-stone-500">
              by {module.author.name ?? "Unknown contributor"} · submitted{" "}
              {new Date(module.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            Close
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-stone-200 bg-white/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Contributor
              </p>
              <p className="mt-2 text-sm font-medium text-stone-900">
                {module.author.name ?? "Unknown contributor"}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-stone-200 bg-white/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Submitted
              </p>
              <p className="mt-2 text-sm font-medium text-stone-900">
                {new Date(module.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Full description
            </p>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/80 px-5 py-4 whitespace-pre-wrap text-sm leading-7 text-stone-700">
              {module.description}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-medium text-stone-600">
            <a
              href={module.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-stone-300 px-4 py-2.5 hover:bg-stone-100 hover:text-stone-900"
            >
              Open repository
            </a>
            {module.demoUrl && (
              <a
                href={module.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-stone-300 px-4 py-2.5 hover:bg-stone-100 hover:text-stone-900"
              >
                Open live demo
              </a>
            )}
          </div>

          <div className="space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Feedback for the contributor (optional)"
              rows={4}
              maxLength={500}
              className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-xs ${
                  feedback.length >= 450 ? "text-amber-700" : "text-stone-400"
                }`}
              >
                {feedback.length} / 500
              </p>
              {isLoading && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-700" />
                  Saving
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-emerald-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction === "APPROVED" ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={onReject}
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-red-700 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-red-50 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction === "REJECTED" ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
