"use client";

interface BatchActionBarProps {
  selectedCount: number;
  onAction: (status: "APPROVED" | "REJECTED") => void;
  isPending: boolean;
}

export function BatchActionBar({
  selectedCount,
  onAction,
  isPending,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/90 px-6 py-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-8">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
          </span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
            Bulk Actions
          </span>
        </div>

        <div className="h-8 w-px bg-gray-100 mx-2" />

        <div className="flex gap-2">
          <button
            onClick={() => onAction("APPROVED")}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? "Approving..." : "Approve All"}
          </button>
          <button
            onClick={() => onAction("REJECTED")}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? "Rejecting..." : "Reject All"}
          </button>
        </div>
      </div>
    </div>
  );
}
