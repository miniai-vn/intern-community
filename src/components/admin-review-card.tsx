"use client";

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
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-3 transition-colors duration-150 hover:border-border-strong">
      <div>
        <h3 className="font-display font-semibold text-text-primary">{module.name}</h3>
        <p className="text-xs text-text-tertiary">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-text-secondary line-clamp-2">{module.description}</p>

      <div className="flex gap-3 text-xs">
        <a href={module.repoUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
          GitHub →
        </a>
        {module.demoUrl && (
          <a href={module.demoUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
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
        className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors duration-150 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
      />

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-semibold text-black shadow-sm shadow-amber-500/20 transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reject
        </button>
      </div>
    </div>
  );
}