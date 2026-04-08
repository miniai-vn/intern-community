"use client";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  moduleName: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  title,
  moduleName,
  description,
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <strong>{moduleName}</strong>? This action cannot be undone.
        </p>
        {description && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
            <p className="text-xs text-amber-800">{description}</p>
          </div>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
