"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Module } from "@/types";

interface AdminReviewCardProps {
  module: Module;
}

export function AdminReviewCard({ module }: AdminReviewCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    try {
      await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-indigo-300/15 bg-slate-900/70 p-5 shadow-[0_14px_35px_rgba(11,14,30,0.35)]">
      <div className="min-w-0">
        <Link
          href={`/modules/${module.slug}`}
          className="block truncate font-semibold text-slate-100 transition hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          {module.name}
        </Link>
        <p className="text-xs text-slate-400">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="line-clamp-2 text-sm text-slate-300">
        {module.description}
      </p>

      <div className="flex gap-2 text-xs">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-300 hover:underline"
        >
          GitHub →
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 hover:underline"
          >
            Demo →
          </a>
        )}
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback for the contributor (optional)"
        rows={2}
        maxLength={500}
        className="w-full rounded-lg border border-indigo-300/20 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/65 focus:ring-2 focus:ring-violet-400/25"
      />

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
