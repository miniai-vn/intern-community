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
  const [error, setError] = useState<string | null>(null);

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `Request failed (${res.status})`);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{module.name}</h3>
          <p className="mt-0.5 text-xs text-muted">
            by {module.author.name} · {module.category.name}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-medium text-accent-subtle-fg">
          {module.category.name}
        </span>
      </div>

      <p className="text-sm text-muted">{module.description}</p>

      <div className="flex gap-3 text-xs">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          GitHub →
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:underline"
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
        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
        >
          Approve
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
