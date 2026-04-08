"use client";

import { SessionProvider } from "next-auth/react";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  // Wrap children so theme text color can inherit via `text-current`
  return (
    <SessionProvider>
      <div className="min-h-full text-current">{children}</div>
    </SessionProvider>
  );
}
