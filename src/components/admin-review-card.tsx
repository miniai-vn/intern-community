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
      const response = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to ${status.toLowerCase()} module (${response.status})`
        );
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900">{module.name}</h3>
        <p className="text-xs text-gray-400">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-gray-600">{module.description}</p>

      <div className="flex gap-2 text-xs">
        <a href={module.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          GitHub →
        </a>
        {module.demoUrl && (
          <a href={module.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Demo →
          </a>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback for the contributor (optional)"
        rows={2}
        maxLength={500}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Approve"}
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
