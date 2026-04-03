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
    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 space-y-3 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition">
      <div>
        <h3 className="font-semibold text-slate-100">{module.name}</h3>
        <p className="text-xs text-slate-400">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-slate-300">{module.description}</p>

      <div className="flex gap-2 text-xs">
        <a href={module.repoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">
          GitHub →
        </a>
        {module.demoUrl && (
          <a href={module.demoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">
            Demo →
          </a>
        )}
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback cho contributor (tuỳ chọn)"
        rows={2}
        maxLength={500}
        className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 transition"
      />

      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-3 py-2 text-xs font-medium text-white hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] disabled:opacity-50 transition"
        >
          ✅ Approve
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-3 py-2 text-xs font-medium text-white hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] disabled:opacity-50 transition"
        >
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
