"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function TodoForm() {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create todo");
      }

      setTitle("");
      toast.success("Task created");
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create task";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-500 transition-all focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="rounded-lg bg-neutral-800 px-6 py-3 font-medium text-white transition-all hover:bg-neutral-700 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
