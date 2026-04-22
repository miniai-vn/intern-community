"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, ModuleStatus } from "@/types";

type SubmissionRowModule = {
  id: string;
  slug: string;
  name: string;
  status: ModuleStatus;
  isLocked: boolean;
  createdAt: Date;
  category: Category;
};

interface MySubmissionRowProps {
  module: SubmissionRowModule;
  returnTo: string;
  statusClassName: string;
}

export function MySubmissionRow({
  module,
  returnTo,
  statusClassName,
}: MySubmissionRowProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setIsDeleteOpen(false);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  const detailHref =
    module.status === "REJECTED"
      ? `/my-submissions/${module.slug}`
      : `/modules/${module.slug}?from=${encodeURIComponent(returnTo)}`;

  const displayStatus = module.isLocked ? "LOCKED" : module.status;
  const displayStatusClassName = module.isLocked
    ? "bg-amber-500/15 text-amber-200 border-amber-400/30"
    : statusClassName;

  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-indigo-300/15 bg-slate-900/70 p-4 shadow-[0_10px_28px_rgba(11,14,30,0.3)]">
        <div className="min-w-0 space-y-1">
          <Link
            href={detailHref}
            className="block truncate font-semibold text-slate-50 transition hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            {module.name}
          </Link>
          <p className="text-xs text-slate-400">
            {module.category.name} ·{" "}
            {new Date(module.createdAt).toLocaleDateString()}
            {module.isLocked ? " · Locked by admin" : ""}
          </p>
        </div>

        <div className="ml-3 flex items-center gap-2">
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${displayStatusClassName}`}
          >
            {displayStatus}
          </span>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
          >
            Delete
          </button>
        </div>
      </div>

      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-indigo-300/15 bg-slate-900 p-5 shadow-[0_24px_60px_rgba(5,8,20,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-100">
              Delete module?
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              This action cannot be undone. The module will be permanently
              removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-indigo-300/20 px-3 py-1.5 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
