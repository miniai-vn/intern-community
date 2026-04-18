"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Module } from "@/types";

interface AdminReviewCardProps {
  module: Module;
}

// Horizontal layout: left section shows module info, right section has
// the feedback textarea + approve/reject buttons — all in a single row.
// This replaces the old vertical card grid with a more compact table-style list.
export function AdminReviewCard({ module }: AdminReviewCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || undefined }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="px-5 py-4">
      {/* ── Main row ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">

        {/* Left: module info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-gray-900">{module.name}</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {module.category.name}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            by {module.author.name} ·{" "}
            {new Date(module.createdAt).toLocaleDateString()}
          </p>

          {/* Description — collapsed by default, toggle on click */}
          <p
            className={`text-sm text-gray-600 ${
              expanded ? "" : "line-clamp-2"
            } cursor-pointer`}
            onClick={() => setExpanded((p) => !p)}
            title={expanded ? "Click to collapse" : "Click to expand"}
          >
            {module.description}
          </p>

          <div className="flex gap-3 text-xs">
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
        </div>

        {/* Right: feedback + actions */}
        <div className="flex shrink-0 flex-col gap-2 sm:w-72">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback (optional)"
            rows={2}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => review("APPROVED")}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "…" : "✓ Approve"}
            </button>
            <button
              onClick={() => review("REJECTED")}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "…" : "✗ Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}