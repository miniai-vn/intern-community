"use client";

import { useState } from "react";
import { AdminReviewCard } from "@/components/admin-review-card";
import { PendingList } from "@/components/pending-list";
import { ToastContainer, useToast } from "@/components/toast";
import { ReviewedModulesList } from "@/components/reviewed-modules-list";
import type { Module } from "@/types";

interface PendingReviewSectionProps {
  pending: Module[];
  nextCursor: string | null;
  totalCount: number;
  onReview: (status: "APPROVED" | "REJECTED", undoFn: () => Promise<void>, moduleId: string) => void;
}

function PendingReviewSection({ pending, nextCursor, totalCount, onReview }: PendingReviewSectionProps) {
  return (
    <section className="space-y-4 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        Pending
        <span className="inline-flex items-center bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-sm font-medium">
          {totalCount}
        </span>
      </h2>

      {pending.length === 0 ? (
        <p className="text-sm text-gray-400">
          All submissions are reviewed. 🎉 Enjoy your day!
        </p>
      ) : (
        <PendingList
          initialModules={pending}
          initialNextCursor={nextCursor}
          totalCount={totalCount}
          onReview={onReview}
        />
      )}
    </section>
  );
}

interface AdminPageLayoutProps {
  pending: Module[];
  nextPendingCursor: string | null;
  totalPending: number;
  recentlyReviewed: Module[];
}

export function AdminPageLayout({
  pending: initialPending,
  nextPendingCursor,
  totalPending,
  recentlyReviewed: initialReviewed,
}: AdminPageLayoutProps) {
  const { toasts, addToast, removeToast } = useToast();
  const [pending, setPending] = useState(initialPending);
  const [recentlyReviewed, setRecentlyReviewed] = useState(initialReviewed);

  const handleReview = async (
    status: "APPROVED" | "REJECTED",
    undoFn: () => Promise<void>,
    moduleId: string
  ) => {
    const statusText = status === "APPROVED" ? "approved" : "rejected";
    
    // Find the module being reviewed
    const module = pending.find((m) => m.id === moduleId);
    if (!module) return;

    // Optimistic update: remove from pending, add to recently reviewed
    setPending((prev) => prev.filter((m) => m.id !== moduleId));
    const reviewed: Module = { ...module, status: status as any, updatedAt: new Date() };
    setRecentlyReviewed((prev) => [reviewed, ...prev]);

    // Show toast with undo
    addToast(`Module ${statusText}`, {
      type: "success",
      duration: 7000,
      action: {
        label: "Undo",
        onClick: async () => {
          try {
            // Undo: remove from recently, add back to pending
            await undoFn();
            setRecentlyReviewed((prev) => prev.filter((m) => m.id !== moduleId));
            setPending((prev) => [module, ...prev]);
            addToast("Undo successful", { type: "success", duration: 3000 });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to undo";
            addToast(message, { type: "error", duration: 5000 });
            // Revert UI changes on error
            setRecentlyReviewed((prev) => [reviewed, ...prev]);
            setPending((prev) => prev.filter((m) => m.id !== moduleId));
          }
        },
      },
    });
  };

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin — Module Review</h1>

        <PendingReviewSection
          pending={initialPending}
          nextCursor={nextPendingCursor}
          totalCount={totalPending}
          onReview={handleReview}
        />

        <section className="space-y-4 mt-12">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Recently Reviewed
            <span className="inline-flex items-center bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {recentlyReviewed.length}
            </span>
          </h2>
          {recentlyReviewed.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet. Decisions will appear here.</p>
          ) : (
            <ReviewedModulesList modules={recentlyReviewed} />
          )}
        </section>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
