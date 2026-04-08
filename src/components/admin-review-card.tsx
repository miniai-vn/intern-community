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
  const [success, setSuccess] = useState(false);

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${res.status}`
        );
      }
      setSuccess(true);
      setFeedback("");
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{module.name}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-400">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>

      <div className="flex gap-2 text-xs">
        <a href={module.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
          GitHub →
        </a>
        {module.demoUrl && (
          <a href={module.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
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
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">Review saved successfully!</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:text-green-500 dark:bg-green-900 dark:hover:bg-green-800"
        >
          {isLoading ? "Saving..." : "Approve"}
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:text-red-500 dark:bg-red-900 dark:hover:bg-red-800"
        >
          {isLoading ? "Saving..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
