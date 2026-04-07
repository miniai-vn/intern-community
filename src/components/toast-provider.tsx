"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        icon: "",
        style: {
          background: "#fff",
          color: "#111",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          padding: "12px 16px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        },
        success: {
          icon: "",
        },
        error: {
          icon: "", 
        },
      }}
    />
  );
}
