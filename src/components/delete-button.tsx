// src/components/delete-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa submission này không?");
    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
    
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Xóa thất bại. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium border-red-200 bg-red-50 text-red-700 hover:bg-red-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}