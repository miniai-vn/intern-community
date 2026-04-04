"use client";

export function RetryHomeButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-200"
    >
      Thử lại ngay
    </button>
  );
}
