"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleConfirmDelete = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 transition-transform page-enter">
            <div className="flex flex-col items-center text-center">
              {/* Bell Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-500 ring-4 ring-amber-50">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>

              <h3 className="mb-1 text-lg font-bold text-slate-800">
                Delete Submission
              </h3>
              <p className="mb-6 text-sm text-slate-500">
                Are you sure you want to delete this submission? This action cannot be undone.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-red-500/25 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-emerald-500/25 active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
