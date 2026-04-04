"use client";

import { useEffect } from "react";

export function MarkAllRead() {
  useEffect(() => {
    fetch("/api/notifications", { method: "PATCH", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } });
  }, []);

  return null;
}
