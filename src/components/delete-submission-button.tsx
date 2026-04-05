"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Popup Confirm
    const check = window.confirm("Bạn có chắc chắn muốn xoá module dự thi này không? Hành động này không thể hoàn tác.");
    if (!check) return;

    // 2. Setup loading state
    setIsLoading(true);

    try {
      // 3. Call server DELETE endpoint
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Không thể xoá module. Hãy thử lại!");
      }

      // 4. Update the server component UI behind the scenes
      router.refresh();
      
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="ml-4 shrink-0 rounded-md bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Xoá bài đăng"
    >
      {isLoading ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
