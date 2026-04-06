"use client";

import { useState, useCallback } from "react";

/** Validates that a URL is HTTPS — required for secure iframe embedding */
export function isValidPreviewUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface SandboxedPreviewProps {
  demoUrl: string;
}

export function SandboxedPreview({ demoUrl }: SandboxedPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoad = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (!isValidPreviewUrl(demoUrl)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        Preview unavailable — only HTTPS URLs are supported.
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Preview failed to load.
      </div>
    );
  }

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-black" : "relative"}>
      {/* Header bar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 ${
          isFullscreen
            ? "bg-gray-900 text-white"
            : "mx-auto w-[360px] rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 text-gray-600"
        }`}
      >
        <span className="text-xs font-medium">Live Preview</span>
        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="rounded px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "✕ Exit" : "⛶ Fullscreen"}
        </button>
      </div>

      {/* Iframe container — phone aspect ratio (9:16) */}
      <div
        className={`relative ${
          isFullscreen
            ? "h-[calc(100%-36px)]"
            : "mx-auto w-[360px] overflow-hidden rounded-b-xl border border-gray-200"
        }`}
        style={isFullscreen ? undefined : { aspectRatio: "9 / 16" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        )}
        <iframe
          src={demoUrl}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className="h-full w-full border-0"
          title="Module live preview"
        />
      </div>
    </div>
  );
}
