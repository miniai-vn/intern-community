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
    <div className="card-elevated space-y-3 p-5">
      <div>
        <h3 className="font-semibold text-foreground">{module.name}</h3>
        <p className="text-xs text-muted-foreground">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">{module.description}</p>

      <div className="flex gap-2 text-xs">
        <a href={module.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
          GitHub →
        </a>
        {module.demoUrl && (
          <a href={module.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
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
        className="input-base input-sm"
      />

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="btn-success flex-1 text-xs px-3 py-2"
        >
          Approve
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="btn-destructive flex-1 text-xs px-3 py-2"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
