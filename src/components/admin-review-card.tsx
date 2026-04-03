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
  const [error, setError] = useState("");

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });
      if (!res.ok) {
        let message = "Failed to submit review. Please try again.";

        try {
          const body = await res.json();
          if (body?.error?.message) {
            message = body.error.message;
          } else if (body?.message) {
            message = body.message;
          }
        } catch {}

        setError(message);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong while submitting the review.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-foreground">{module.name}</h3>
        <p className="text-xs text-muted-foreground">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">{module.description}</p>

      <div className="flex gap-2 text-xs">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          GitHub →
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
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
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Approve"}
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
