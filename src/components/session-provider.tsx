"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./toast-provider";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
    </SessionProvider>
  );
}
