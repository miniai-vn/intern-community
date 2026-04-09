"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ moduleId }: { moduleId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Cannot delete submission");
      }
      
      alert("Submission deleted successfully!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="mt-2 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete Submission"}
    </button>
  );
}