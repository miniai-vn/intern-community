"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminReviewCard } from "@/components/admin-review-card";
import { BatchActionBar } from "@/components/batch-action-bar";
import type { Module } from "@/types";

interface AdminDashboardProps {
  initialPending: Module[];
  initialRecentlyReviewed: Module[];
}

export function AdminDashboard({
  initialPending,
  initialRecentlyReviewed,
}: AdminDashboardProps) {
  const router = useRouter();
  const [isPendingTransform, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Optimistic updates for the lists
  const [optimisticState, addOptimisticAction] = useOptimistic(
    { pending: initialPending, recentlyReviewed: initialRecentlyReviewed },
    (state, action: { type: "REVIEW"; ids: string[]; status: "APPROVED" | "REJECTED" }) => {
      const movedModules = state.pending.filter((m) => action.ids.includes(m.id));
      const remainingPending = state.pending.filter((m) => !action.ids.includes(m.id));
      
      const newReviewed = movedModules.map((m) => ({
        ...m,
        status: action.status,
        updatedAt: new Date(),
      }));

      return {
        pending: remainingPending,
        recentlyReviewed: [...newReviewed, ...state.recentlyReviewed].slice(0, 10),
      };
    }
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchAction = async (status: "APPROVED" | "REJECTED") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    startTransition(async () => {
      // 1. Optimistic Update
      addOptimisticAction({ type: "REVIEW", ids, status });
      setSelectedIds(new Set());

      // 2. Real Update
      try {
        const res = await fetch("/api/modules/batch", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, status }),
        });
        
        if (!res.ok) throw new Error("Batch action failed");
        
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Failed to perform batch action. Please try again.");
      }
    });
  };

  const handleSingleReview = async (id: string, status: "APPROVED" | "REJECTED", feedback?: string, reviewerNote?: string) => {
    startTransition(async () => {
      // 1. Optimistic Update
      addOptimisticAction({ type: "REVIEW", ids: [id], status });
      
      // 2. Real Update
      try {
        const res = await fetch(`/api/modules/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, feedback, reviewerNote }),
        });
        
        if (!res.ok) throw new Error("Review action failed");
        
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Failed to review module. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-8 relative pb-24">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            Pending Tasks ({optimisticState.pending.length})
          </h2>
          {optimisticState.pending.length > 0 && (
            <button 
              onClick={() => {
                if (selectedIds.size === optimisticState.pending.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(optimisticState.pending.map(m => m.id)));
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {selectedIds.size === optimisticState.pending.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {optimisticState.pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No pending submissions. Well done! 🎉</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {optimisticState.pending.map((module) => (
              <AdminReviewCard 
                key={module.id} 
                module={module} 
                isSelected={selectedIds.has(module.id)}
                onSelect={() => toggleSelect(module.id)}
                onReview={handleSingleReview}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Audit Log (Recently Reviewed)</h2>
        <div className="space-y-2">
          {optimisticState.recentlyReviewed.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{module.name}</span>
                <span className="text-[10px] text-gray-400 capitalize">
                  Reviewed by {module.author.name}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  module.status === "APPROVED"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {module.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Batch Action Bar */}
      <BatchActionBar 
        selectedCount={selectedIds.size} 
        onAction={handleBatchAction} 
        isPending={isPendingTransform} 
      />
    </div>
  );
}
