"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SmartBackButtonProps {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
}

export function SmartBackButton({
  fallbackHref,
  className,
  children,
}: SmartBackButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleBack() {
    const from = searchParams?.get("from");
    if (from && from.startsWith("/") && !from.startsWith("//")) {
      router.push(from);
      return;
    }

    if (typeof window === "undefined") {
      router.push(fallbackHref);
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={handleBack} className={className}>
      {children}
    </button>
  );
}
