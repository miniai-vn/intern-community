"use client";

import { useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    options?: {
      type?: "success" | "error" | "info";
      duration?: number;
      action?: { label: string; onClick: () => void };
    }
  ) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      id,
      message,
      type: options?.type ?? "info",
      action: options?.action,
      duration: options?.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-[50px] right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-4 rounded-xl px-5 py-4 shadow-xl text-base font-medium animate-in fade-in slide-in-from-top-2 border transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : toast.type === "error"
                ? "bg-red-50 border-red-300 text-red-900"
                : "bg-blue-50 border-blue-300 text-blue-900"
          }`}
        >
          <span className="flex-1 pt-0.5">{toast.message}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                onRemove(toast.id);
              }}
              className="shrink-0 px-3 py-2 rounded-lg font-semibold text-sm bg-white/60 hover:bg-white transition-all hover:shadow-md active:scale-95 hover:cursor-pointer"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 text-lg opacity-40 hover:opacity-70 transition-opacity active:scale-95 hover:cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
