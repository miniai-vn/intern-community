"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./confirm-dialog";

interface DeleteButtonProps {
  submissionId: string;
  submissionName: string;
  deleteAction: (id: string) => Promise<void>;
}

export function DeleteSubmissionButton({ submissionId, submissionName, deleteAction }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setShowConfirm(false);
    
    try {
      await deleteAction(submissionId);
      
      // Refresh server data
      router.refresh();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Không thể xóa submission. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Đang xóa...' : 'Xóa'}
      </button>
      
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Xác nhận xóa submission"
        message={`Bạn có chắc chắn muốn xóa submission "${submissionName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </>
  );
}
