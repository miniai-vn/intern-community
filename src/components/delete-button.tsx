"use client";

import { useRouter } from "next/navigation";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    await fetch(`/api/modules/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
    >
      Delete
    </button>
  );
}
