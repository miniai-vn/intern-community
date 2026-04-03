"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSubmissionButtonProps {
  moduleId: string;
}

export function DeleteSubmissionButton({ moduleId }: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete submission.");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error: unknown) {
      console.error("Error deleting submission:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(message);
      setIsModalOpen(false);
      setIsErrorModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
        className="ml-4 inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
      >
        <TrashIcon />
        Delete
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isDeleting && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <TrashIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                This will permanently remove your submission. This action is irreversible.
              </p>
              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  Keep Submission
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsErrorModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircleIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Deletion Failed</h3>
              <p className="mt-2 text-sm text-red-600 font-medium">
                Error: {errorMessage}
              </p>
              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                Failed to delete submission. Please try again or contact support if the issue persists.
              </p>
              <div className="mt-6 w-full">
                <button
                  type="button"
                  onClick={() => setIsErrorModalOpen(false)}
                  className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function AlertCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
