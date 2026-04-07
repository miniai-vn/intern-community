"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface TodoItemProps {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: string;
}

export function TodoItem({ id, title, isComplete, createdAt }: TodoItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function toggleComplete() {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isComplete: !isComplete }),
      });

      if (!response.ok) throw new Error("Failed to update todo");
      
      toast.success(isComplete ? "Task moved to Not Done" : "Task completed");
      router.refresh();
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");
      toast.success("Task deleted!");
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  }

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="group flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
    >
      <button
        onClick={toggleComplete}
        disabled={isUpdating}
        className={`mt-1 h-5 w-5 flex-shrink-0 rounded border-2 transition-all disabled:opacity-50 ${
          isComplete
            ? "border-green-500 bg-green-500"
            : "border-neutral-300 bg-white hover:border-neutral-400"
        }`}
        aria-label="Toggle task completion"
      >
        {isComplete && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </motion.svg>
        )}
      </button>

      <div className="flex-1">
        <motion.p
          animate={{ opacity: isComplete ? 0.5 : 1 }}
          className={`text-sm font-medium transition-all ${
            isComplete
              ? "line-through text-neutral-500"
              : "text-neutral-900"
          }`}
        >
          {title}
        </motion.p>
        <p className="mt-1 text-xs text-neutral-500">Created {timeAgo}</p>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex-shrink-0 text-neutral-300 transition-colors opacity-0 group-hover:opacity-100 hover:text-red-600 disabled:opacity-50"
        aria-label="Delete task"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </motion.div>
  );
}
