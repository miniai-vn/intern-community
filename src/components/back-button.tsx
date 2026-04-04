"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackUrl?: string;
  children: React.ReactNode;
  className?: string;
}

export function BackButton({
  fallbackUrl = "/",
  children,
  className = "text-sm text-gray-400 hover:text-gray-600",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in history, fallback to provided URL if can't
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button onClick={handleBack} className={className}>
      {children}
    </button>
  );
}
