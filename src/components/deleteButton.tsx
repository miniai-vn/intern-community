"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

export function DeleteButton({ id }: { id: string }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete");
        return;
      }
      // 👉 refresh server data (không reload full page)
      // Delete thành công thì đóng modal và refresh lại trang để cập nhật UI
      setShowModal(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="text-xs cursor-pointer px-2 py-1 rounded bg-red-300 text-red-800 hover:bg-white hover:font-md transition disabled:cursor-not-allowed disabled:bg-red-200 disabled:text-red-400"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Xóa bài nộp này?"
        loading={loading}
      />
    </>
  );
}