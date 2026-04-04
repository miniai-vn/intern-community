"use client";

import { useState } from "react";
import type { Module } from "@/types";

interface AdminReviewCardProps {
  module: Module;
  isSelected: boolean;
  onSelect: () => void;
  onReview: (id: string, status: "APPROVED" | "REJECTED", feedback?: string, reviewerNote?: string) => Promise<void>;
}

export function AdminReviewCard({ 
  module, 
  isSelected, 
  onSelect, 
  onReview 
}: AdminReviewCardProps) {
  const [feedback, setFeedback] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    setIsSubmitting(true);
    try {
      await onReview(module.id, status, feedback || undefined, reviewerNote || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`relative flex flex-col gap-3 rounded-xl border p-5 transition-all bg-white shadow-sm hover:shadow-md ${
        isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
      }`}
    >
      {/* Selector Checkbox */}
      <div className="absolute top-4 right-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <div className="pr-8">
        <h3 className="font-bold text-gray-900 line-clamp-1">{module.name}</h3>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
        {module.description}
      </p>

      <div className="flex gap-3 text-xs font-semibold">
        <a 
          href={module.repoUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          GitHub Repo
        </a>
        {module.demoUrl && (
          <a 
            href={module.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Live Demo
          </a>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex flex-col gap-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback for the developer (public)"
            rows={1}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs transition-colors focus:border-blue-500 focus:outline-none"
          />
          
          {showNotes ? (
            <textarea
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Internal reviewer note (rejection only)"
              rows={1}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs italic transition-colors focus:border-gray-300 focus:outline-none"
            />
          ) : (
            <button 
              onClick={() => setShowNotes(true)}
              className="text-[10px] text-left text-gray-400 hover:text-gray-600"
            >
              + Add internal note
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleReview("APPROVED")}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => handleReview("REJECTED")}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
