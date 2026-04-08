"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function ClientThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
